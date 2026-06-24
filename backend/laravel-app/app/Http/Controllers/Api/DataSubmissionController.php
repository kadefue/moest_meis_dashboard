<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActualData;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DataSubmissionController extends Controller
{
    public function submit(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'indicator_id' => 'required|string|max:10|exists:indicators,indicator_id',
            'period' => 'required|string|max:20',
            'actual_value' => 'required|numeric',
            'region' => 'required|string|max:100',
            'district' => 'nullable|string|max:100',
            'ward' => 'nullable|string|max:100',
            'submitted_by' => 'required|string|max:100',
            'source_category' => 'required|string|max:50',
        ]);

        $username = $request->header('X-User-Username') ?: $validated['submitted_by'];
        if ($username) {
            $user = \App\Models\User::where('email', strtolower($username))->first();
            if ($user && is_array($user->permissions) && !in_array('submit_data', $user->permissions)) {
                return response()->json(['error' => 'Forbidden', 'message' => 'You do not have permission to submit data.'], 403);
            }
        }

        // MSDD Page 8 constraint: Attempting to post a record to ACTUAL_DATA referencing an indicator with is_derived = TRUE triggers an automatic validation exception.
        $indicator = \App\Models\Indicator::find($validated['indicator_id']);
        if ($indicator && $indicator->is_derived) {
            return response()->json([
                'error' => 'Validation Exception',
                'message' => 'Attempting to post actual data for a derived indicator is restricted.'
            ], 422);
        }

        $actualsCount = ActualData::count();
        $dataId = 'DAT-0' . ($actualsCount + 1);

        $entry = ActualData::create(array_merge($validated, [
            'data_id' => $dataId,
            'date_submitted' => now(),
            'status' => 'Submitted'
        ]));

        // Write to immutable audit trails
        AuditLog::create([
            'timestamp' => now(),
            'username' => $validated['submitted_by'],
            'action' => 'SUBMIT',
            'entity' => 'Actual Data',
            'details' => "Logged actual value of {$validated['actual_value']} for indicator {$validated['indicator_id']} in region {$validated['region']}"
        ]);

        return response()->json(['message' => 'Data entry submitted successfully', 'data' => $entry], 201);
    }

    public function verify($id, Request $request): JsonResponse
    {
        $entry = ActualData::find($id);
        if (!$entry) {
            return response()->json(['error' => 'Submission record not found'], 404);
        }

        $verifier = $request->header('X-User-Username') ?: $request->input('verifier_username', 'coordinator.national@moe.go.tz');

        if ($verifier) {
            $user = \App\Models\User::where('email', strtolower($verifier))->first();
            if ($user && is_array($user->permissions) && !in_array('verify_data', $user->permissions)) {
                return response()->json(['error' => 'Forbidden', 'message' => 'You do not have permission to verify data.'], 403);
            }
        }

        $entry->update(['status' => 'Verified']);

        AuditLog::create([
            'timestamp' => now(),
            'username' => $verifier,
            'action' => 'UPDATE',
            'entity' => 'Actual Data',
            'details' => "Verified data submission record {$id}"
        ]);

        return response()->json(['message' => 'Record verified successfully', 'data' => $entry]);
    }

    public function approve($id, Request $request): JsonResponse
    {
        $entry = ActualData::find($id);
        if (!$entry) {
            return response()->json(['error' => 'Submission record not found'], 404);
        }

        $approver = $request->header('X-User-Username') ?: $request->input('approver_username', 'executive@moe.go.tz');

        if ($approver) {
            $user = \App\Models\User::where('email', strtolower($approver))->first();
            if ($user && is_array($user->permissions) && !in_array('approve_data', $user->permissions)) {
                return response()->json(['error' => 'Forbidden', 'message' => 'You do not have permission to approve data.'], 403);
            }
        }

        $entry->update(['status' => 'Approved']);

        AuditLog::create([
            'timestamp' => now(),
            'username' => $approver,
            'action' => 'APPROVE',
            'entity' => 'Actual Data',
            'details' => "Approved data submission record {$id}"
        ]);

        return response()->json(['message' => 'Record approved successfully', 'data' => $entry]);
    }

    public function auditLogs(): JsonResponse
    {
        $logs = AuditLog::orderBy('timestamp', 'desc')->get();
        return response()->json(['data' => $logs]);
    }

    public function index(): JsonResponse
    {
        return response()->json(['data' => ActualData::all()]);
    }

    public function show($id): JsonResponse
    {
        $entry = ActualData::with('indicator')->find($id);
        if (!$entry) {
            return response()->json(['error' => 'Submission record not found'], 404);
        }
        return response()->json(['data' => $entry]);
    }

    protected function authorizeActor($submittedBy, Request $request): bool
    {
        $actorUsername = $request->header('X-User-Username') ?: $request->input('updated_by') ?: $request->input('deleted_by');
        
        if ($actorUsername) {
            $user = \App\Models\User::where('email', strtolower($actorUsername))->first();
            if ($user && is_array($user->permissions)) {
                if (in_array('manage_settings', $user->permissions)) {
                    return true;
                }
                if (in_array('submit_data', $user->permissions) && $submittedBy && strtolower($submittedBy) === strtolower($actorUsername)) {
                    return true;
                }
            }
        }

        $actorRole = $request->header('X-User-Role');

        // Permit System Administrator and National M&E Officer
        if (in_array($actorRole, ['System Administrator', 'National M&E Officer'])) {
            return true;
        }

        // Permit owner of the entry
        if ($submittedBy && $actorUsername && strtolower($submittedBy) === strtolower($actorUsername)) {
            return true;
        }

        return false;
    }

    public function update($id, Request $request): JsonResponse
    {
        $entry = ActualData::find($id);
        if (!$entry) {
            return response()->json(['error' => 'Submission record not found'], 404);
        }

        if (!$this->authorizeActor($entry->submitted_by, $request)) {
            return response()->json(['error' => 'Forbidden', 'message' => 'You are not authorized to update this entry.'], 403);
        }

        $validated = $request->validate([
            'indicator_id' => 'sometimes|required|string|max:10|exists:indicators,indicator_id',
            'period' => 'sometimes|required|string|max:20',
            'actual_value' => 'sometimes|required|numeric',
            'region' => 'sometimes|required|string|max:100',
            'district' => 'nullable|string|max:100',
            'ward' => 'nullable|string|max:100',
            'source_category' => 'sometimes|required|string|max:50',
            'status' => 'sometimes|required|string|max:20',
            'updated_by' => 'nullable|string'
        ]);

        if ($request->has('indicator_id')) {
            $indicator = \App\Models\Indicator::find($validated['indicator_id']);
            if ($indicator && $indicator->is_derived) {
                return response()->json([
                    'error' => 'Validation Exception',
                    'message' => 'Attempting to post actual data for a derived indicator is restricted.'
                ], 422);
            }
        }

        $oldValue = $entry->actual_value;
        $oldStatus = $entry->status;

        // If the entry is already verified/approved, editing resets its status to Submitted
        if (in_array($oldStatus, ['Verified', 'Approved'])) {
            $validated['status'] = 'Submitted';
        }

        $actorUsername = $request->header('X-User-Username') ?: $request->input('updated_by') ?: 'unknown';

        $entry->update(array_merge($validated, [
            'updated_by' => $actorUsername
        ]));

        AuditLog::create([
            'timestamp' => now(),
            'username' => $actorUsername,
            'action' => 'UPDATE',
            'entity' => 'Actual Data',
            'details' => "Updated data submission {$id}: value changed from {$oldValue} to {$entry->actual_value}. Status reset from {$oldStatus} to Submitted."
        ]);

        return response()->json(['message' => 'Submission record updated successfully', 'data' => $entry]);
    }

    public function destroy($id, Request $request): JsonResponse
    {
        $entry = ActualData::find($id);
        if (!$entry) {
            return response()->json(['error' => 'Submission record not found'], 404);
        }

        if (!$this->authorizeActor($entry->submitted_by, $request)) {
            return response()->json(['error' => 'Forbidden', 'message' => 'You are not authorized to delete this entry.'], 403);
        }

        $actorUsername = $request->header('X-User-Username') ?: $request->input('deleted_by') ?: 'unknown';

        $entry->deleted_by = $actorUsername;
        $entry->save();
        $entry->delete();

        AuditLog::create([
            'timestamp' => now(),
            'username' => $actorUsername,
            'action' => 'DELETE',
            'entity' => 'Actual Data',
            'details' => "Soft deleted data submission {$id} with value {$entry->actual_value}"
        ]);

        return response()->json(['message' => 'Submission record soft deleted successfully']);
    }
}
