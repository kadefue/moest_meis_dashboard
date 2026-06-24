<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Target;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TargetController extends Controller
{
    /**
     * List all targets.
     */
    public function index(): JsonResponse
    {
        return response()->json(['data' => Target::all()]);
    }

    /**
     * View a single target.
     */
    public function show($id): JsonResponse
    {
        $target = Target::with(['indicator', 'framework'])->find($id);
        if (!$target) {
            return response()->json(['error' => 'Target not found'], 404);
        }
        return response()->json(['data' => $target]);
    }

    /**
     * Store a new target.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'target_id' => 'required|string|max:10|unique:targets',
            'indicator_id' => 'required|string|max:10|exists:indicators,indicator_id',
            'framework_id' => 'required|string|max:10|exists:frameworks,framework_id',
            'financial_year' => 'required|string|max:20',
            'target_type' => 'required|string|max:50',
            'region' => 'required|string|max:100',
            'district' => 'nullable|string|max:100',
            'ward' => 'nullable|string|max:100',
            'baseline_year' => 'required|string|max:20',
            'baseline_value' => 'required|numeric',
            'target_value' => 'required|numeric',
            'created_by' => 'nullable|string'
        ]);

        $target = Target::create($validated);
        return response()->json(['message' => 'Target configured successfully', 'data' => $target], 201);
    }

    /**
     * Update a target.
     */
    public function update($id, Request $request): JsonResponse
    {
        $target = Target::find($id);
        if (!$target) {
            return response()->json(['error' => 'Target not found'], 404);
        }

        $validated = $request->validate([
            'indicator_id' => 'sometimes|required|string|max:10|exists:indicators,indicator_id',
            'framework_id' => 'sometimes|required|string|max:10|exists:frameworks,framework_id',
            'financial_year' => 'sometimes|required|string|max:20',
            'target_type' => 'sometimes|required|string|max:50',
            'region' => 'sometimes|required|string|max:100',
            'district' => 'nullable|string|max:100',
            'ward' => 'nullable|string|max:100',
            'baseline_year' => 'sometimes|required|string|max:20',
            'baseline_value' => 'sometimes|required|numeric',
            'target_value' => 'sometimes|required|numeric',
            'updated_by' => 'nullable|string'
        ]);

        $target->update(array_merge($validated, [
            'updated_by' => $request->input('updated_by', 'admin@moe.go.tz')
        ]));

        return response()->json(['message' => 'Target updated successfully', 'data' => $target]);
    }

    /**
     * Delete a target (Soft Delete).
     */
    public function destroy($id, Request $request): JsonResponse
    {
        $target = Target::find($id);
        if (!$target) {
            return response()->json(['error' => 'Target not found'], 404);
        }

        $target->deleted_by = $request->input('deleted_by', 'admin@moe.go.tz');
        $target->save();
        $target->delete();

        return response()->json(['message' => 'Target soft deleted successfully']);
    }
}
