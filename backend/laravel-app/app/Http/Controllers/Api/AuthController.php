<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * List all system users.
     */
    public function index(): JsonResponse
    {
        // Return users list (automatically hides passwords and remember tokens via User model settings)
        $users = User::all()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->email, // Map email to frontend's expected 'username'
                'role' => $user->role,
                'dept' => $user->dept,
                'permissions' => $user->permissions ?? []
            ];
        });

        return response()->json(['data' => $users]);
    }

    /**
     * User authentication / login.
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', strtolower($validated['email']))->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'error' => 'Authentication Failed',
                'message' => 'Invalid email or password.'
            ], 401);
        }

        // Return user details and a mock token
        return response()->json([
            'message' => 'Login successful',
            'data' => [
                'name' => $user->name,
                'username' => $user->email,
                'role' => $user->role,
                'dept' => $user->dept,
                'permissions' => $user->permissions ?? [],
                'token' => 'mock-token-' . Str::random(16)
            ]
        ]);
    }

    /**
     * Register a new user.
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'required|string|max:100',
            'dept' => 'nullable|string|max:100',
            'permissions' => 'nullable|array'
        ]);

        // Default permissions if none provided based on role
        if (!isset($validated['permissions']) || empty($validated['permissions'])) {
            $validated['permissions'] = $this->getDefaultPermissionsForRole($validated['role']);
        }

        $user = User::create([
            'name' => $validated['name'],
            'email' => strtolower($validated['email']),
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'dept' => $validated['dept'] ?? null,
            'permissions' => $validated['permissions']
        ]);

        // Log this action to the e-GA audit trail
        $creator = $request->header('X-User-Username') ?? 'system';
        AuditLog::create([
            'timestamp' => now(),
            'username' => $creator,
            'action' => 'CREATE',
            'entity' => 'User',
            'details' => "Registered new user: {$user->email} with role: {$user->role}"
        ]);

        return response()->json([
            'message' => 'User registered successfully',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->email,
                'role' => $user->role,
                'dept' => $user->dept,
                'permissions' => $user->permissions
            ]
        ], 201);
    }

    /**
     * Update an existing user.
     */
    public function update($id, Request $request): JsonResponse
    {
        // $id could be numeric ID or email string
        $user = is_numeric($id) ? User::find($id) : User::where('email', strtolower($id))->first();

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'role' => 'required|string|max:100',
            'dept' => 'nullable|string|max:100',
            'permissions' => 'nullable|array',
            'password' => 'nullable|string|min:6'
        ]);

        $updateData = [
            'name' => $validated['name'],
            'role' => $validated['role'],
            'dept' => $validated['dept'] ?? null,
            'permissions' => $validated['permissions'] ?? []
        ];

        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);

        // Log this action to the audit trail
        $editor = $request->header('X-User-Username') ?? 'system';
        AuditLog::create([
            'timestamp' => now(),
            'username' => $editor,
            'action' => 'UPDATE',
            'entity' => 'User',
            'details' => "Updated user scopes and permissions for: {$user->email}"
        ]);

        return response()->json([
            'message' => 'User updated successfully',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->email,
                'role' => $user->role,
                'dept' => $user->dept,
                'permissions' => $user->permissions
            ]
        ]);
    }

    /**
     * Delete a user.
     */
    public function destroy($id, Request $request): JsonResponse
    {
        $user = is_numeric($id) ? User::find($id) : User::where('email', strtolower($id))->first();

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        $email = $user->email;
        $user->delete();

        // Log this action to the audit trail
        $editor = $request->header('X-User-Username') ?? 'system';
        AuditLog::create([
            'timestamp' => now(),
            'username' => $editor,
            'action' => 'DELETE',
            'entity' => 'User',
            'details' => "Deleted user account: {$email}"
        ]);

        return response()->json(['message' => 'User account deleted successfully']);
    }

    /**
     * Get default permissions mapping for a role.
     */
    private function getDefaultPermissionsForRole(string $role): array
    {
        switch ($role) {
            case 'System Administrator':
                return ['view_dashboard', 'submit_data', 'verify_data', 'approve_data', 'manage_settings'];
            case 'MoEST Leadership':
                return ['view_dashboard', 'approve_data'];
            case 'National M&E Officer':
                return ['view_dashboard', 'submit_data', 'verify_data', 'manage_settings'];
            case 'Regional M&E Officer':
                return ['view_dashboard', 'submit_data', 'verify_data'];
            case 'District Education Officer':
            case 'School Data Entry Officer':
            default:
                return ['view_dashboard', 'submit_data'];
        }
    }
}
