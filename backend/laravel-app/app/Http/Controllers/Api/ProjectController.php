<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectNode;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProjectController extends Controller
{
    protected function authorizeRole(Request $request): bool
    {
        $username = $request->header('X-User-Username');
        if ($username) {
            $user = \App\Models\User::where('email', strtolower($username))->first();
            if ($user && is_array($user->permissions)) {
                return in_array('manage_settings', $user->permissions);
            }
        }
        $actorRole = $request->header('X-User-Role') ?: 'System Administrator';
        return in_array($actorRole, ['System Administrator', 'National M&E Officer']);
    }

    public function index(): JsonResponse
    {
        return response()->json(['data' => Project::all()]);
    }

    public function show($id): JsonResponse
    {
        $project = Project::with('nodes')->find($id);
        if (!$project) {
            return response()->json(['error' => 'Project not found'], 404);
        }
        return response()->json(['data' => $project]);
    }

    public function store(Request $request): JsonResponse
    {
        if (!$this->authorizeRole($request)) {
            return response()->json(['error' => 'Forbidden', 'message' => 'You are not authorized to perform this action.'], 403);
        }

        $validated = $request->validate([
            'project_id' => 'required|string|max:10|unique:projects',
            'name' => 'required|string|max:255',
            'start_year' => 'required|integer',
            'end_year' => 'required|integer',
            'created_by' => 'nullable|string'
        ]);

        $actorUsername = $request->header('X-User-Username') ?: $request->input('created_by') ?: 'unknown';
        $project = Project::create(array_merge($validated, [
            'created_by' => $actorUsername
        ]));

        \App\Models\AuditLog::create([
            'timestamp' => now(),
            'username' => $actorUsername,
            'action' => 'CREATE',
            'entity' => 'Project',
            'details' => "Created strategic project {$project->project_id}: {$project->name}"
        ]);

        return response()->json(['message' => 'Project created successfully', 'data' => $project], 201);
    }

    public function nodes($projectId): JsonResponse
    {
        $nodes = ProjectNode::where('project_id', $projectId)->get();
        return response()->json(['data' => $nodes]);
    }

    public function storeNode($projectId, Request $request): JsonResponse
    {
        if (!$this->authorizeRole($request)) {
            return response()->json(['error' => 'Forbidden', 'message' => 'You are not authorized to perform this action.'], 403);
        }

        $validated = $request->validate([
            'node_id' => 'required|string|max:10|unique:project_nodes',
            'parent_node_id' => 'nullable|string|max:10|exists:project_nodes,node_id',
            'level_type' => 'required|string|max:50',
            'name' => 'required|string|max:255',
            'created_by' => 'nullable|string'
        ]);

        $actorUsername = $request->header('X-User-Username') ?: $request->input('created_by') ?: 'unknown';
        $node = ProjectNode::create(array_merge($validated, [
            'project_id' => $projectId,
            'created_by' => $actorUsername
        ]));

        \App\Models\AuditLog::create([
            'timestamp' => now(),
            'username' => $actorUsername,
            'action' => 'CREATE',
            'entity' => 'Project Node',
            'details' => "Created project node {$node->node_id} under project {$projectId}"
        ]);

        return response()->json(['message' => 'Project Node created successfully', 'data' => $node], 201);
    }

    public function update($id, Request $request): JsonResponse
    {
        if (!$this->authorizeRole($request)) {
            return response()->json(['error' => 'Forbidden', 'message' => 'You are not authorized to perform this action.'], 403);
        }

        $project = Project::find($id);
        if (!$project) {
            return response()->json(['error' => 'Project not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'start_year' => 'sometimes|required|integer',
            'end_year' => 'sometimes|required|integer',
            'updated_by' => 'nullable|string'
        ]);

        $actorUsername = $request->header('X-User-Username') ?: $request->input('updated_by') ?: 'unknown';
        $project->update(array_merge($validated, [
            'updated_by' => $actorUsername
        ]));

        \App\Models\AuditLog::create([
            'timestamp' => now(),
            'username' => $actorUsername,
            'action' => 'UPDATE',
            'entity' => 'Project',
            'details' => "Updated strategic project {$id}"
        ]);

        return response()->json(['message' => 'Project updated successfully', 'data' => $project]);
    }

    public function destroy($id, Request $request): JsonResponse
    {
        if (!$this->authorizeRole($request)) {
            return response()->json(['error' => 'Forbidden', 'message' => 'You are not authorized to perform this action.'], 403);
        }

        $project = Project::find($id);
        if (!$project) {
            return response()->json(['error' => 'Project not found'], 404);
        }

        $actorUsername = $request->header('X-User-Username') ?: $request->input('deleted_by') ?: 'unknown';
        $project->deleted_by = $actorUsername;
        $project->save();
        $project->delete();

        \App\Models\AuditLog::create([
            'timestamp' => now(),
            'username' => $actorUsername,
            'action' => 'DELETE',
            'entity' => 'Project',
            'details' => "Soft deleted strategic project {$id}"
        ]);

        return response()->json(['message' => 'Project soft deleted successfully']);
    }

    public function showNode($nodeId): JsonResponse
    {
        $node = ProjectNode::with(['project', 'parent', 'children', 'indicators'])->find($nodeId);
        if (!$node) {
            return response()->json(['error' => 'Project Node not found'], 404);
        }
        return response()->json(['data' => $node]);
    }

    public function updateNode($nodeId, Request $request): JsonResponse
    {
        if (!$this->authorizeRole($request)) {
            return response()->json(['error' => 'Forbidden', 'message' => 'You are not authorized to perform this action.'], 403);
        }

        $node = ProjectNode::find($nodeId);
        if (!$node) {
            return response()->json(['error' => 'Project Node not found'], 404);
        }

        $validated = $request->validate([
            'parent_node_id' => 'nullable|string|max:10|exists:project_nodes,node_id',
            'level_type' => 'sometimes|required|string|max:50',
            'name' => 'sometimes|required|string|max:255',
            'updated_by' => 'nullable|string'
        ]);

        $actorUsername = $request->header('X-User-Username') ?: $request->input('updated_by') ?: 'unknown';
        $node->update(array_merge($validated, [
            'updated_by' => $actorUsername
        ]));

        \App\Models\AuditLog::create([
            'timestamp' => now(),
            'username' => $actorUsername,
            'action' => 'UPDATE',
            'entity' => 'Project Node',
            'details' => "Updated project node {$nodeId}"
        ]);

        return response()->json(['message' => 'Project Node updated successfully', 'data' => $node]);
    }

    public function destroyNode($nodeId, Request $request): JsonResponse
    {
        if (!$this->authorizeRole($request)) {
            return response()->json(['error' => 'Forbidden', 'message' => 'You are not authorized to perform this action.'], 403);
        }

        $node = ProjectNode::find($nodeId);
        if (!$node) {
            return response()->json(['error' => 'Project Node not found'], 404);
        }

        // Check if node has children
        $hasChildren = ProjectNode::where('parent_node_id', $nodeId)->exists();
        if ($hasChildren) {
            return response()->json([
                'error' => 'Validation Error',
                'message' => 'Cannot delete a parent node that has children. Please delete all children nodes first.'
            ], 422);
        }

        $actorUsername = $request->header('X-User-Username') ?: $request->input('deleted_by') ?: 'unknown';
        $node->deleted_by = $actorUsername;
        $node->save();
        $node->delete();

        \App\Models\AuditLog::create([
            'timestamp' => now(),
            'username' => $actorUsername,
            'action' => 'DELETE',
            'entity' => 'Project Node',
            'details' => "Soft deleted project node {$nodeId}"
        ]);

        return response()->json(['message' => 'Project Node soft deleted successfully']);
    }
}
