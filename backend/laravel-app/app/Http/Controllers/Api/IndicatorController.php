<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Indicator;
use App\Models\Target;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class IndicatorController extends Controller
{
    protected function authorizeRole(Request $request): bool
    {
        $actorRole = $request->header('X-User-Role') ?: 'System Administrator';
        return in_array($actorRole, ['System Administrator', 'National M&E Officer']);
    }

    public function index(): JsonResponse
    {
        $indicators = Indicator::with('metadata')->get();
        return response()->json(['data' => $indicators]);
    }

    public function show($id): JsonResponse
    {
        $indicator = Indicator::with(['metadata', 'targets', 'actuals'])->find($id);
        if (!$indicator) {
            return response()->json(['error' => 'Indicator not found'], 404);
        }
        return response()->json(['data' => $indicator]);
    }

    public function store(Request $request): JsonResponse
    {
        if (!$this->authorizeRole($request)) {
            return response()->json(['error' => 'Forbidden', 'message' => 'You are not authorized to perform this action.'], 403);
        }

        $validated = $request->validate([
            'indicator_id' => 'required|string|max:10|unique:indicators',
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:50',
            'is_derived' => 'required|boolean',
            'formula' => 'nullable|string',
            'associated_node_id' => 'nullable|string|max:10',
            'associated_activity_id' => 'nullable|string|max:10',
            'created_by' => 'nullable|string'
        ]);

        $actorUsername = $request->header('X-User-Username') ?: $request->input('created_by') ?: 'unknown';
        $indicator = Indicator::create(array_merge($validated, [
            'created_by' => $actorUsername
        ]));
        
        // Setup metadata if supplied
        if ($request->has('metadata')) {
            $metaData = $request->validate([
                'metadata.unit' => 'required|string',
                'metadata.frequency' => 'required|string',
                'metadata.data_source' => 'required|string',
                'metadata.verification_means' => 'required|string',
                'metadata.responsible_unit' => 'required|string',
            ]);
            $indicator->metadata()->create(array_merge($metaData['metadata'], [
                'created_by' => $actorUsername
            ]));
        }

        \App\Models\AuditLog::create([
            'timestamp' => now(),
            'username' => $actorUsername,
            'action' => 'CREATE',
            'entity' => 'Indicator',
            'details' => "Created KPI indicator {$indicator->indicator_id}: {$indicator->name}"
        ]);

        return response()->json(['message' => 'Indicator configured successfully', 'data' => $indicator->load('metadata')], 201);
    }

    public function targets($indicatorId): JsonResponse
    {
        $targets = Target::where('indicator_id', $indicatorId)->get();
        return response()->json(['data' => $targets]);
    }

    public function update($id, Request $request): JsonResponse
    {
        if (!$this->authorizeRole($request)) {
            return response()->json(['error' => 'Forbidden', 'message' => 'You are not authorized to perform this action.'], 403);
        }

        $indicator = Indicator::find($id);
        if (!$indicator) {
            return response()->json(['error' => 'Indicator not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|required|string|max:50',
            'is_derived' => 'sometimes|required|boolean',
            'formula' => 'nullable|string',
            'associated_node_id' => 'nullable|string|max:10',
            'associated_activity_id' => 'nullable|string|max:10',
            'updated_by' => 'nullable|string'
        ]);

        $actorUsername = $request->header('X-User-Username') ?: $request->input('updated_by') ?: 'unknown';
        $indicator->update(array_merge($validated, [
            'updated_by' => $actorUsername
        ]));

        if ($request->has('metadata')) {
            $metaData = $request->validate([
                'metadata.unit' => 'sometimes|required|string',
                'metadata.frequency' => 'sometimes|required|string',
                'metadata.data_source' => 'sometimes|required|string',
                'metadata.verification_means' => 'sometimes|required|string',
                'metadata.responsible_unit' => 'sometimes|required|string',
            ]);
            $indicator->metadata()->update(array_merge($metaData['metadata'], [
                'updated_by' => $actorUsername
            ]));
        }

        \App\Models\AuditLog::create([
            'timestamp' => now(),
            'username' => $actorUsername,
            'action' => 'UPDATE',
            'entity' => 'Indicator',
            'details' => "Updated KPI indicator {$id}"
        ]);

        return response()->json(['message' => 'Indicator updated successfully', 'data' => $indicator->load('metadata')]);
    }

    public function destroy($id, Request $request): JsonResponse
    {
        if (!$this->authorizeRole($request)) {
            return response()->json(['error' => 'Forbidden', 'message' => 'You are not authorized to perform this action.'], 403);
        }

        $indicator = Indicator::find($id);
        if (!$indicator) {
            return response()->json(['error' => 'Indicator not found'], 404);
        }

        $actorUsername = $request->header('X-User-Username') ?: $request->input('deleted_by') ?: 'unknown';
        $indicator->deleted_by = $actorUsername;
        $indicator->save();
        $indicator->delete();

        \App\Models\AuditLog::create([
            'timestamp' => now(),
            'username' => $actorUsername,
            'action' => 'DELETE',
            'entity' => 'Indicator',
            'details' => "Soft deleted KPI indicator {$id}"
        ]);

        return response()->json(['message' => 'Indicator soft deleted successfully']);
    }

    public function showMetadata($indicatorId): JsonResponse
    {
        $metadata = \App\Models\IndicatorMetadata::find($indicatorId);
        if (!$metadata) {
            return response()->json(['error' => 'Indicator metadata not found'], 404);
        }
        return response()->json(['data' => $metadata]);
    }

    public function updateMetadata($indicatorId, Request $request): JsonResponse
    {
        if (!$this->authorizeRole($request)) {
            return response()->json(['error' => 'Forbidden', 'message' => 'You are not authorized to perform this action.'], 403);
        }

        $metadata = \App\Models\IndicatorMetadata::find($indicatorId);
        if (!$metadata) {
            return response()->json(['error' => 'Indicator metadata not found'], 404);
        }

        $validated = $request->validate([
            'unit' => 'sometimes|required|string',
            'frequency' => 'sometimes|required|string',
            'data_source' => 'sometimes|required|string',
            'verification_means' => 'sometimes|required|string',
            'responsible_unit' => 'sometimes|required|string',
            'updated_by' => 'nullable|string'
        ]);

        $actorUsername = $request->header('X-User-Username') ?: $request->input('updated_by') ?: 'unknown';
        $metadata->update(array_merge($validated, [
            'updated_by' => $actorUsername
        ]));

        \App\Models\AuditLog::create([
            'timestamp' => now(),
            'username' => $actorUsername,
            'action' => 'UPDATE',
            'entity' => 'Indicator Metadata',
            'details' => "Updated metadata for KPI indicator {$indicatorId}"
        ]);

        return response()->json(['message' => 'Indicator metadata updated successfully', 'data' => $metadata]);
    }

    public function destroyMetadata($indicatorId, Request $request): JsonResponse
    {
        if (!$this->authorizeRole($request)) {
            return response()->json(['error' => 'Forbidden', 'message' => 'You are not authorized to perform this action.'], 403);
        }

        $metadata = \App\Models\IndicatorMetadata::find($indicatorId);
        if (!$metadata) {
            return response()->json(['error' => 'Indicator metadata not found'], 404);
        }

        $actorUsername = $request->header('X-User-Username') ?: $request->input('deleted_by') ?: 'unknown';
        $metadata->deleted_by = $actorUsername;
        $metadata->save();
        $metadata->delete();

        \App\Models\AuditLog::create([
            'timestamp' => now(),
            'username' => $actorUsername,
            'action' => 'DELETE',
            'entity' => 'Indicator Metadata',
            'details' => "Soft deleted metadata for KPI indicator {$indicatorId}"
        ]);

        return response()->json(['message' => 'Indicator metadata soft deleted successfully']);
    }
}
