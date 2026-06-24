<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Indicator;
use App\Models\ActualData;
use App\Models\Target;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ReportController extends Controller
{
    /**
     * Compile performance report data.
     */
    public function generate(Request $request): JsonResponse
    {
        $frameworkId = $request->query('framework_id', 'FW-001');
        $region = $request->query('region', 'All');
        $period = $request->query('period', '2024/25');

        // Fetch targets matching the framework and period
        $targets = Target::where('framework_id', $frameworkId)
            ->where('financial_year', $period);

        if ($region !== 'All') {
            $targets = $targets->where('region', $region);
        }

        $targets = $targets->get();

        // Compile indicator performance summaries
        $reportRows = $targets->groupBy('indicator_id')->map(function ($items, $indicatorId) use ($period, $region) {
            $indicator = Indicator::find($indicatorId);
            
            // Get actuals
            $actualsQuery = ActualData::where('indicator_id', $indicatorId)
                ->where('period', 'like', substr($period, 0, 7) . '%');

            if ($region !== 'All') {
                $actualsQuery = $actualsQuery->where('region', $region);
            }

            $actuals = $actualsQuery->get();

            $avgActual = $actuals->avg('actual_value');
            $avgTarget = $items->avg('target_value');
            
            // Status and Attainment calculations
            $attainment = $avgTarget > 0 ? ($avgActual / $avgTarget * 100) : 0;
            $isLowerBetter = ($indicatorId === 'IND-002');
            
            if ($isLowerBetter) {
                $attainment = $avgActual <= $avgTarget ? 100 : max(0, 100 - (($avgActual - $avgTarget) / $avgTarget * 100));
            }

            $status = 'No Data';
            if ($avgActual !== null) {
                if ($isLowerBetter) {
                    $status = $avgActual <= $avgTarget ? 'On Track' : ($avgActual <= $avgTarget * 1.1 ? 'At Risk' : 'Below Target');
                } else {
                    $status = $attainment >= 100 ? 'On Track' : ($attainment >= 90 ? 'At Risk' : 'Below Target');
                }
            }

            return [
                'indicator_id' => $indicatorId,
                'name' => $indicator ? $indicator->name : 'Unknown Indicator',
                'type' => $indicator ? $indicator->type : 'Unknown',
                'actual_value' => $avgActual ? round($avgActual, 2) : null,
                'target_value' => round($avgTarget, 2),
                'attainment_percentage' => round($attainment, 1),
                'status' => $status
            ];
        })->values();

        return response()->json([
            'data' => [
                'scope' => [
                    'framework_id' => $frameworkId,
                    'region' => $region,
                    'period' => $period,
                    'compiled_at' => now()->toIso8601String()
                ],
                'rows' => $reportRows
            ]
        ]);
    }
}
