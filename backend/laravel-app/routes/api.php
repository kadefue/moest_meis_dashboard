<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\FrameworkController;
use App\Http\Controllers\Api\IndicatorController;
use App\Http\Controllers\Api\DataSubmissionController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ActivityController;
use App\Http\Controllers\Api\TargetController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RoleController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('api')->group(function () {
    
    // API Root / Status
    Route::get('/', function () {
        return response()->json([
            'status' => 'active',
            'system' => 'MoEST Monitoring & Evaluation API Portal',
            'version' => '1.0.0',
            'endpoints' => [
                '/docs' => 'Interactive Swagger API Documentation UI',
                '/api/summary' => 'High-level metrics summary',
                '/api/performance' => 'KPI target performance and calculations',
                '/api/frameworks' => 'Strategic frameworks list',
                '/api/indicators' => 'Key Performance Indicators list',
                '/api/reports' => 'Data compiled for reports and summaries',
                '/api/audit-logs' => 'Immutable system audit trail logs'
            ]
        ]);
    });
    
    // Dashboard endpoints
    Route::get('/summary', [DashboardController::class, 'summary']);
    Route::get('/performance', [DashboardController::class, 'performance']);

    // 1. Frameworks CRUD
    Route::get('/frameworks', [FrameworkController::class, 'index']);
    Route::post('/frameworks', [FrameworkController::class, 'store']);
    Route::get('/frameworks/{id}', [FrameworkController::class, 'show']);
    Route::put('/frameworks/{id}', [FrameworkController::class, 'update']);
    Route::delete('/frameworks/{id}', [FrameworkController::class, 'destroy']);

    // 2. Framework Nodes CRUD (nested queries + direct CRUD)
    Route::get('/frameworks/{id}/nodes', [FrameworkController::class, 'nodes']);
    Route::post('/frameworks/{id}/nodes', [FrameworkController::class, 'storeNode']);
    Route::get('/nodes/{id}', [FrameworkController::class, 'showNode']);
    Route::put('/nodes/{id}', [FrameworkController::class, 'updateNode']);
    Route::delete('/nodes/{id}', [FrameworkController::class, 'destroyNode']);

    // 2.5 Projects & Project Nodes CRUD
    Route::get('/projects', [ProjectController::class, 'index']);
    Route::post('/projects', [ProjectController::class, 'store']);
    Route::get('/projects/{id}', [ProjectController::class, 'show']);
    Route::put('/projects/{id}', [ProjectController::class, 'update']);
    Route::delete('/projects/{id}', [ProjectController::class, 'destroy']);

    Route::get('/projects/{id}/nodes', [ProjectController::class, 'nodes']);
    Route::post('/projects/{id}/nodes', [ProjectController::class, 'storeNode']);
    Route::get('/project-nodes/{id}', [ProjectController::class, 'showNode']);
    Route::put('/project-nodes/{id}', [ProjectController::class, 'updateNode']);
    Route::delete('/project-nodes/{id}', [ProjectController::class, 'destroyNode']);

    // 3. Activities CRUD
    Route::get('/activities', [ActivityController::class, 'index']);
    Route::post('/activities', [ActivityController::class, 'store']);
    Route::get('/activities/{id}', [ActivityController::class, 'show']);
    Route::put('/activities/{id}', [ActivityController::class, 'update']);
    Route::delete('/activities/{id}', [ActivityController::class, 'destroy']);

    // 4. Activity Mappings CRUD
    Route::get('/mappings', [ActivityController::class, 'indexMapping']);
    Route::post('/mappings', [ActivityController::class, 'storeMapping']);
    Route::get('/mappings/{id}', [ActivityController::class, 'showMapping']);
    Route::put('/mappings/{id}', [ActivityController::class, 'updateMapping']);
    Route::delete('/mappings/{id}', [ActivityController::class, 'destroyMapping']);

    // 5. Indicators CRUD
    Route::get('/indicators', [IndicatorController::class, 'index']);
    Route::post('/indicators', [IndicatorController::class, 'store']);
    Route::get('/indicators/{id}', [IndicatorController::class, 'show']);
    Route::put('/indicators/{id}', [IndicatorController::class, 'update']);
    Route::delete('/indicators/{id}', [IndicatorController::class, 'destroy']);

    // 6. Indicator Metadata CRUD
    Route::get('/indicators/{id}/metadata', [IndicatorController::class, 'showMetadata']);
    Route::put('/indicators/{id}/metadata', [IndicatorController::class, 'updateMetadata']);
    Route::delete('/indicators/{id}/metadata', [IndicatorController::class, 'destroyMetadata']);

    // 7. Targets CRUD
    Route::get('/targets', [TargetController::class, 'index']);
    Route::post('/targets', [TargetController::class, 'store']);
    Route::get('/targets/{id}', [TargetController::class, 'show']);
    Route::put('/targets/{id}', [TargetController::class, 'update']);
    Route::delete('/targets/{id}', [TargetController::class, 'destroy']);
    Route::get('/indicators/{id}/targets', [IndicatorController::class, 'targets']);

    // 8. Actual Data / Submissions CRUD
    Route::get('/submissions', [DataSubmissionController::class, 'index']);
    Route::post('/submissions', [DataSubmissionController::class, 'submit']);
    Route::get('/submissions/{id}', [DataSubmissionController::class, 'show']);
    Route::put('/submissions/{id}', [DataSubmissionController::class, 'update']);
    Route::delete('/submissions/{id}', [DataSubmissionController::class, 'destroy']);
    Route::post('/submit', [DataSubmissionController::class, 'submit']); // legacy alias
    Route::post('/submissions/{id}/verify', [DataSubmissionController::class, 'verify']);
    Route::post('/submissions/{id}/approve', [DataSubmissionController::class, 'approve']);
    
    // Audit logs
    Route::get('/audit-logs', [DataSubmissionController::class, 'auditLogs']);

    // Reports compilations
    Route::get('/reports', [ReportController::class, 'generate']);

    // Auth & User Management CRUD
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::get('/users', [AuthController::class, 'index']);
    Route::put('/users/{id}', [AuthController::class, 'update']);
    Route::delete('/users/{id}', [AuthController::class, 'destroy']);

    // Role Setup CRUD
    Route::get('/roles', [RoleController::class, 'index']);
    Route::post('/roles', [RoleController::class, 'store']);
    Route::get('/roles/{id}', [RoleController::class, 'show']);
    Route::put('/roles/{id}', [RoleController::class, 'update']);
    Route::delete('/roles/{id}', [RoleController::class, 'destroy']);
});
