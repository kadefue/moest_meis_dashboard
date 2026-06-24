<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function frameworks()
    {
        // Example static response. Replace with Eloquent model queries.
        $frameworks = [
            ['framework_id' => 'FW-001', 'name' => 'ESDP III', 'start_year' => 2024, 'end_year' => 2029],
            ['framework_id' => 'FW-002', 'name' => 'SDGs', 'start_year' => 2015, 'end_year' => 2030],
        ];

        return response()->json(['data' => $frameworks]);
    }

    public function summary()
    {
        // Example summary data
        $summary = [
            'activities_total' => 1245,
            'indicators_tracked' => 342,
            'reports_pending' => 12,
        ];

        return response()->json(['data' => $summary]);
    }
}

// Drop into: app/Http/Controllers/Api/DashboardController.php
