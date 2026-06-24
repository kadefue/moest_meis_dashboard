<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\ActivityMapping;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ActivityController extends Controller
{
    /**
     * List all activities.
     */
    public function index(): JsonResponse
    {
        return response()->json(['data' => Activity::all()]);
    }

    /**
     * View a single activity.
     */
    public function show($id): JsonResponse
    {
        $activity = Activity::with(['nodes', 'indicators'])->find($id);
        if (!$activity) {
            return response()->json(['error' => 'Activity not found'], 404);
        }
        return response()->json(['data' => $activity]);
    }

    /**
     * Store a new activity.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'activity_id' => 'required|string|max:10|unique:activities',
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date',
            'budget' => 'required|numeric',
            'owner_unit' => 'required|string|max:100',
            'created_by' => 'nullable|string'
        ]);

        $activity = Activity::create($validated);
        return response()->json(['message' => 'Activity created successfully', 'data' => $activity], 201);
    }

    /**
     * Update an activity.
     */
    public function update($id, Request $request): JsonResponse
    {
        $activity = Activity::find($id);
        if (!$activity) {
            return response()->json(['error' => 'Activity not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'sometimes|required|date',
            'budget' => 'sometimes|required|numeric',
            'owner_unit' => 'sometimes|required|string|max:100',
            'updated_by' => 'nullable|string'
        ]);

        $activity->update(array_merge($validated, [
            'updated_by' => $request->input('updated_by', 'admin@moe.go.tz')
        ]));

        return response()->json(['message' => 'Activity updated successfully', 'data' => $activity]);
    }

    /**
     * Delete an activity (Soft Delete).
     */
    public function destroy($id, Request $request): JsonResponse
    {
        $activity = Activity::find($id);
        if (!$activity) {
            return response()->json(['error' => 'Activity not found'], 404);
        }

        $activity->deleted_by = $request->input('deleted_by', 'admin@moe.go.tz');
        $activity->save();
        $activity->delete();

        return response()->json(['message' => 'Activity soft deleted successfully']);
    }

    /**
     * List all activity mappings.
     */
    public function indexMapping(): JsonResponse
    {
        return response()->json(['data' => ActivityMapping::all()]);
    }

    /**
     * View a single mapping.
     */
    public function showMapping($id): JsonResponse
    {
        $mapping = ActivityMapping::with(['activity', 'node'])->find($id);
        if (!$mapping) {
            return response()->json(['error' => 'Activity mapping not found'], 404);
        }
        return response()->json(['data' => $mapping]);
    }

    /**
     * Store a new activity mapping.
     */
    public function storeMapping(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'mapping_id' => 'required|string|max:10|unique:activity_mappings',
            'activity_id' => 'required|string|max:10|exists:activities,activity_id',
            'node_id' => 'required|string|max:10|exists:framework_nodes,node_id',
            'created_by' => 'nullable|string'
        ]);

        $mapping = ActivityMapping::create($validated);
        return response()->json(['message' => 'Activity mapping created successfully', 'data' => $mapping], 201);
    }

    /**
     * Update an activity mapping.
     */
    public function updateMapping($id, Request $request): JsonResponse
    {
        $mapping = ActivityMapping::find($id);
        if (!$mapping) {
            return response()->json(['error' => 'Activity mapping not found'], 404);
        }

        $validated = $request->validate([
            'activity_id' => 'sometimes|required|string|max:10|exists:activities,activity_id',
            'node_id' => 'sometimes|required|string|max:10|exists:framework_nodes,node_id',
            'updated_by' => 'nullable|string'
        ]);

        $mapping->update(array_merge($validated, [
            'updated_by' => $request->input('updated_by', 'admin@moe.go.tz')
        ]));

        return response()->json(['message' => 'Activity mapping updated successfully', 'data' => $mapping]);
    }

    /**
     * Delete an activity mapping (Soft Delete).
     */
    public function destroyMapping($id, Request $request): JsonResponse
    {
        $mapping = ActivityMapping::find($id);
        if (!$mapping) {
            return response()->json(['error' => 'Activity mapping not found'], 404);
        }

        $mapping->deleted_by = $request->input('deleted_by', 'admin@moe.go.tz');
        $mapping->save();
        $mapping->delete();

        return response()->json(['message' => 'Activity mapping soft deleted successfully']);
    }
}
