<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Framework;
use App\Models\FrameworkNode;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class FrameworkController extends Controller
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
        return response()->json(['data' => Framework::all()]);
    }

    public function show($id): JsonResponse
    {
        $framework = Framework::with('nodes')->find($id);
        if (!$framework) {
            return response()->json(['error' => 'Framework not found'], 404);
        }
        return response()->json(['data' => $framework]);
    }

    public function store(Request $request): JsonResponse
    {
        if (!$this->authorizeRole($request)) {
            return response()->json(['error' => 'Forbidden', 'message' => 'You are not authorized to perform this action.'], 403);
        }

        $validated = $request->validate([
            'framework_id' => 'required|string|max:10|unique:frameworks',
            'name' => 'required|string|max:255',
            'start_year' => 'required|integer',
            'end_year' => 'required|integer',
            'created_by' => 'nullable|string'
        ]);

        $actorUsername = $request->header('X-User-Username') ?: $request->input('created_by') ?: 'unknown';
        $framework = Framework::create(array_merge($validated, [
            'created_by' => $actorUsername
        ]));

        \App\Models\AuditLog::create([
            'timestamp' => now(),
            'username' => $actorUsername,
            'action' => 'CREATE',
            'entity' => 'Framework',
            'details' => "Created strategic framework {$framework->framework_id}: {$framework->name}"
        ]);

        return response()->json(['message' => 'Framework created successfully', 'data' => $framework], 210);
    }

    public function nodes($frameworkId): JsonResponse
    {
        $nodes = FrameworkNode::where('framework_id', $frameworkId)->get();
        return response()->json(['data' => $nodes]);
    }

    public function storeNode($frameworkId, Request $request): JsonResponse
    {
        if (!$this->authorizeRole($request)) {
            return response()->json(['error' => 'Forbidden', 'message' => 'You are not authorized to perform this action.'], 403);
        }

        $validated = $request->validate([
            'node_id' => 'required|string|max:10|unique:framework_nodes',
            'parent_node_id' => 'nullable|string|max:10|exists:framework_nodes,node_id',
            'level_type' => 'required|string|max:50',
            'name' => 'required|string|max:255',
            'created_by' => 'nullable|string'
        ]);

        $actorUsername = $request->header('X-User-Username') ?: $request->input('created_by') ?: 'unknown';
        $node = FrameworkNode::create(array_merge($validated, [
            'framework_id' => $frameworkId,
            'created_by' => $actorUsername
        ]));

        \App\Models\AuditLog::create([
            'timestamp' => now(),
            'username' => $actorUsername,
            'action' => 'CREATE',
            'entity' => 'Framework Node',
            'details' => "Created framework node {$node->node_id} under framework {$frameworkId}"
        ]);

        return response()->json(['message' => 'Framework Node created successfully', 'data' => $node], 201);
    }

    public function update($id, Request $request): JsonResponse
    {
        if (!$this->authorizeRole($request)) {
            return response()->json(['error' => 'Forbidden', 'message' => 'You are not authorized to perform this action.'], 403);
        }

        $framework = Framework::find($id);
        if (!$framework) {
            return response()->json(['error' => 'Framework not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'start_year' => 'sometimes|required|integer',
            'end_year' => 'sometimes|required|integer',
            'updated_by' => 'nullable|string'
        ]);

        $actorUsername = $request->header('X-User-Username') ?: $request->input('updated_by') ?: 'unknown';
        $framework->update(array_merge($validated, [
            'updated_by' => $actorUsername
        ]));

        \App\Models\AuditLog::create([
            'timestamp' => now(),
            'username' => $actorUsername,
            'action' => 'UPDATE',
            'entity' => 'Framework',
            'details' => "Updated strategic framework {$id}"
        ]);

        return response()->json(['message' => 'Framework updated successfully', 'data' => $framework]);
    }

    public function destroy($id, Request $request): JsonResponse
    {
        if (!$this->authorizeRole($request)) {
            return response()->json(['error' => 'Forbidden', 'message' => 'You are not authorized to perform this action.'], 403);
        }

        $framework = Framework::find($id);
        if (!$framework) {
            return response()->json(['error' => 'Framework not found'], 404);
        }

        $actorUsername = $request->header('X-User-Username') ?: $request->input('deleted_by') ?: 'unknown';
        $framework->deleted_by = $actorUsername;
        $framework->save();
        $framework->delete();

        \App\Models\AuditLog::create([
            'timestamp' => now(),
            'username' => $actorUsername,
            'action' => 'DELETE',
            'entity' => 'Framework',
            'details' => "Soft deleted strategic framework {$id}"
        ]);

        return response()->json(['message' => 'Framework soft deleted successfully']);
    }

    public function showNode($nodeId): JsonResponse
    {
        $node = FrameworkNode::with(['framework', 'parent', 'children', 'activities', 'indicators'])->find($nodeId);
        if (!$node) {
            return response()->json(['error' => 'Framework Node not found'], 404);
        }
        return response()->json(['data' => $node]);
    }

    public function updateNode($nodeId, Request $request): JsonResponse
    {
        if (!$this->authorizeRole($request)) {
            return response()->json(['error' => 'Forbidden', 'message' => 'You are not authorized to perform this action.'], 403);
        }

        $node = FrameworkNode::find($nodeId);
        if (!$node) {
            return response()->json(['error' => 'Framework Node not found'], 404);
        }

        $validated = $request->validate([
            'parent_node_id' => 'nullable|string|max:10|exists:framework_nodes,node_id',
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
            'entity' => 'Framework Node',
            'details' => "Updated framework node {$nodeId}"
        ]);

        return response()->json(['message' => 'Framework Node updated successfully', 'data' => $node]);
    }

    public function destroyNode($nodeId, Request $request): JsonResponse
    {
        if (!$this->authorizeRole($request)) {
            return response()->json(['error' => 'Forbidden', 'message' => 'You are not authorized to perform this action.'], 403);
        }

        $node = FrameworkNode::find($nodeId);
        if (!$node) {
            return response()->json(['error' => 'Framework Node not found'], 404);
        }

        // Check if node has children
        $hasChildren = FrameworkNode::where('parent_node_id', $nodeId)->exists();
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
            'entity' => 'Framework Node',
            'details' => "Soft deleted framework node {$nodeId}"
        ]);

        return response()->json(['message' => 'Framework Node soft deleted successfully']);
    }
}
