<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class RoleController extends Controller
{
    /**
     * Helper to restrict write endpoints to System Administrators only.
     */
    protected function authorizeAdmin(Request $request): bool
    {
        $actorRole = $request->header('X-User-Role') ?: 'System Administrator';
        
        // Also check if user exists in db and has manage_settings permission
        $username = $request->header('X-User-Username');
        if ($username) {
            $user = \App\Models\User::where('email', strtolower($username))->first();
            if ($user && is_array($user->permissions)) {
                return in_array('manage_settings', $user->permissions) && $user->role === 'System Administrator';
            }
        }

        return $actorRole === 'System Administrator';
    }

    /**
     * List all roles.
     */
    public function index(): JsonResponse
    {
        return response()->json(['data' => Role::all()]);
    }

    /**
     * View a single role.
     */
    public function show($id): JsonResponse
    {
        $role = is_numeric($id) ? Role::find($id) : Role::where('name', $id)->first();
        if (!$role) {
            return response()->json(['error' => 'Role not found'], 404);
        }
        return response()->json(['data' => $role]);
    }

    /**
     * Store a new role.
     */
    public function store(Request $request): JsonResponse
    {
        if (!$this->authorizeAdmin($request)) {
            return response()->json(['error' => 'Forbidden', 'message' => 'Only System Administrators can manage roles.'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:roles',
            'description' => 'nullable|string|max:255',
            'default_permissions' => 'nullable|array'
        ]);

        $creator = $request->header('X-User-Username') ?? 'system';

        $role = Role::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'default_permissions' => $validated['default_permissions'] ?? [],
            'created_by' => $creator
        ]);

        // Write to audit trail
        AuditLog::create([
            'timestamp' => now(),
            'username' => $creator,
            'action' => 'CREATE',
            'entity' => 'Role',
            'details' => "Created new role: {$role->name} with default permissions: " . json_encode($role->default_permissions)
        ]);

        return response()->json([
            'message' => 'Role defined successfully',
            'data' => $role
        ], 201);
    }

    /**
     * Update an existing role.
     */
    public function update($id, Request $request): JsonResponse
    {
        if (!$this->authorizeAdmin($request)) {
            return response()->json(['error' => 'Forbidden', 'message' => 'Only System Administrators can manage roles.'], 403);
        }

        $role = is_numeric($id) ? Role::find($id) : Role::where('name', $id)->first();
        if (!$role) {
            return response()->json(['error' => 'Role not found'], 404);
        }

        $validated = $request->validate([
            'description' => 'nullable|string|max:255',
            'default_permissions' => 'nullable|array'
        ]);

        $editor = $request->header('X-User-Username') ?? 'system';

        $role->update([
            'description' => $validated['description'] ?? $role->description,
            'default_permissions' => $validated['default_permissions'] ?? $role->default_permissions,
            'updated_by' => $editor
        ]);

        // Write to audit trail
        AuditLog::create([
            'timestamp' => now(),
            'username' => $editor,
            'action' => 'UPDATE',
            'entity' => 'Role',
            'details' => "Updated default permissions for role: {$role->name}"
        ]);

        return response()->json([
            'message' => 'Role updated successfully',
            'data' => $role
        ]);
    }

    /**
     * Delete a role.
     */
    public function destroy($id, Request $request): JsonResponse
    {
        if (!$this->authorizeAdmin($request)) {
            return response()->json(['error' => 'Forbidden', 'message' => 'Only System Administrators can manage roles.'], 403);
        }

        $role = is_numeric($id) ? Role::find($id) : Role::where('name', $id)->first();
        if (!$role) {
            return response()->json(['error' => 'Role not found'], 404);
        }

        // Prevent deleting core system administrator role
        if ($role->name === 'System Administrator') {
            return response()->json(['error' => 'Validation Exception', 'message' => 'The System Administrator role is a core configuration and cannot be deleted.'], 422);
        }

        $roleName = $role->name;
        $role->deleted_by = $request->header('X-User-Username') ?? 'system';
        $role->save();
        $role->delete();

        // Write to audit trail
        AuditLog::create([
            'timestamp' => now(),
            'username' => $request->header('X-User-Username') ?? 'system',
            'action' => 'DELETE',
            'entity' => 'Role',
            'details' => "Deleted role configuration: {$roleName}"
        ]);

        return response()->json(['message' => "Role '{$roleName}' deleted successfully"]);
    }
}
