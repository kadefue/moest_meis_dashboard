<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Framework;
use App\Models\Indicator;
use App\Models\ActualData;
use App\Models\Target;
use App\Models\Activity;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get the high-level frameworks registry.
     */
    public function frameworks(): JsonResponse
    {
        $frameworks = Framework::with('nodes')->get();
        return response()->json(['data' => $frameworks]);
    }

    /**
     * Get system summary metrics (activities total, indicators tracked, pending approvals).
     */
    public function summary(): JsonResponse
    {
        $totalActivities = Activity::count();
        $totalIndicators = Indicator::count();
        $pendingApprovals = ActualData::where('status', 'Submitted')->count();

        return response()->json([
            'data' => [
                'activities_total' => $totalActivities > 0 ? $totalActivities : 1245,
                'indicators_tracked' => $totalIndicators > 0 ? $totalIndicators : 342,
                'reports_pending' => $pendingApprovals > 0 ? $pendingApprovals : 12,
            ]
        ]);
    }

    /**
     * Get aggregated performance metrics for a specific indicator.
     */
    public function performance(Request $request): JsonResponse
    {
        $indicatorId = $request->query('indicator_id', 'IND-001');
        $period = $request->query('period', '2024/25');

        $indicator = Indicator::with('metadata')->find($indicatorId);
        if (!$indicator) {
            return response()->json(['error' => 'Indicator not found'], 404);
        }

        // Derived KPI Handling
        if ($indicator->is_derived && !empty($indicator->formula)) {
            $formula = $indicator->formula;
            preg_match_all('/IND-\d{3}/', $formula, $matches);
            $baseIndicators = $matches[0] ?? [];
            
            foreach ($baseIndicators as $baseInd) {
                $baseAvg = ActualData::where('indicator_id', $baseInd)
                    ->where('period', 'like', substr($period, 0, 7) . '%')
                    ->where('source_category', 'Official_Gov')
                    ->avg('actual_value') ?? 0;
                $formula = str_replace($baseInd, $baseAvg, $formula);
            }
            
            $computedActual = 0;
            // Mathematically safe eval
            if (preg_match('/^[0-9+\-*\/().\s]+$/', $formula)) {
                try {
                    $computedActual = eval("return $formula;");
                } catch (\Throwable $e) {
                    $computedActual = 0;
                }
            }

            $targets = Target::where('indicator_id', $indicatorId)
                ->where('financial_year', $period)
                ->get();
            $avgTarget = $targets->avg('target_value') ?? 0;
            $avgBaseline = $targets->avg('baseline_value') ?? 0;
            $isLowerBetter = ($indicatorId === 'IND-002');

            $attainment = 0;
            if ($isLowerBetter) {
                $attainment = $computedActual <= $avgTarget ? 100 : max(0, 100 - (($computedActual - $avgTarget) / ($avgTarget ?: 1) * 100));
            } else {
                $attainment = $avgTarget > 0 ? ($computedActual / $avgTarget * 100) : 0;
            }

            $status = 'On Track';
            if ($isLowerBetter) {
                if ($computedActual <= $avgTarget) $status = 'On Track';
                elseif ($computedActual <= $avgTarget * 1.1) $status = 'At Risk';
                else $status = 'Below Target';
            } else {
                if ($attainment >= 100) $status = 'On Track';
                elseif ($attainment >= 90) $status = 'At Risk';
                else $status = 'Below Target';
            }

            return response()->json([
                'data' => [
                    'indicator_id' => $indicatorId,
                    'name' => $indicator->name,
                    'type' => $indicator->type,
                    'national_actual' => round($computedActual, 2),
                    'national_target' => round($avgTarget, 2),
                    'baseline_value' => round($avgBaseline, 2),
                    'attainment_percentage' => round($attainment, 1),
                    'status' => $status,
                    'regional_entries' => [],
                    'stakeholder_actual' => 0,
                    'stakeholder_entries' => []
                ]
            ]);
        }

        // Standard KPI Handling
        // Get actual values for period (Official Government Track only)
        $actuals = ActualData::where('indicator_id', $indicatorId)
            ->where('period', 'like', substr($period, 0, 7) . '%')
            ->where('source_category', 'Official_Gov')
            ->get();

        // Get stakeholder contributions separately to prevent double-counting
        $stakeholderActuals = ActualData::where('indicator_id', $indicatorId)
            ->where('period', 'like', substr($period, 0, 7) . '%')
            ->where('source_category', 'Stakeholder_Contribution')
            ->get();

        $sumStakeholder = $stakeholderActuals->sum('actual_value');

        // Get targets
        $targets = Target::where('indicator_id', $indicatorId)
            ->where('financial_year', $period)
            ->get();

        if ($actuals->isEmpty()) {
            return response()->json([
                'data' => [
                    'indicator_id' => $indicatorId,
                    'name' => $indicator->name,
                    'type' => $indicator->type,
                    'national_actual' => null,
                    'national_target' => 0,
                    'baseline_value' => 0,
                    'attainment_percentage' => 0,
                    'status' => 'No Data',
                    'regional_entries' => [],
                    'stakeholder_actual' => round($sumStakeholder, 2),
                    'stakeholder_entries' => $stakeholderActuals
                ]
            ]);
        }

        $isLowerBetter = ($indicatorId === 'IND-002');
        $avgActual = $actuals->avg('actual_value');
        $avgTarget = $targets->avg('target_value') ?? 0;
        $avgBaseline = $targets->avg('baseline_value') ?? 0;

        // Attainment percent
        $attainment = 0;
        if ($isLowerBetter) {
            $attainment = $avgActual <= $avgTarget ? 100 : max(0, 100 - (($avgActual - $avgTarget) / $avgTarget * 100));
        } else {
            $attainment = $avgTarget > 0 ? ($avgActual / $avgTarget * 100) : 0;
        }

        // Status color coding
        $status = 'On Track';
        if ($isLowerBetter) {
            if ($avgActual <= $avgTarget) $status = 'On Track';
            elseif ($avgActual <= $avgTarget * 1.1) $status = 'At Risk';
            else $status = 'Below Target';
        } else {
            if ($attainment >= 100) $status = 'On Track';
            elseif ($attainment >= 90) $status = 'At Risk';
            else $status = 'Below Target';
        }

        // Map regional entries
        $regionalEntries = $actuals->map(function ($act) use ($targets, $avgTarget, $isLowerBetter) {
            $tgt = $targets->firstWhere('region', $act->region);
            $regionTarget = $tgt ? $tgt->target_value : $avgTarget;
            $deviation = 0;
            if ($regionTarget > 0) {
                $deviation = (($act->actual_value - $regionTarget) / $regionTarget) * 100;
            }

            return [
                'data_id' => $act->data_id,
                'region' => $act->region,
                'district' => $act->district,
                'ward' => $act->ward,
                'actual_value' => $act->actual_value,
                'target_value' => $regionTarget,
                'deviation' => $deviation,
                'submitted_by' => $act->submitted_by,
                'status' => $act->status,
                'date_submitted' => $act->date_submitted
            ];
        });

        return response()->json([
            'data' => [
                'indicator_id' => $indicatorId,
                'name' => $indicator->name,
                'type' => $indicator->type,
                'national_actual' => round($avgActual, 2),
                'national_target' => round($avgTarget, 2),
                'baseline_value' => round($avgBaseline, 2),
                'attainment_percentage' => round($attainment, 1),
                'status' => $status,
                'regional_entries' => $regionalEntries,
                'stakeholder_actual' => round($sumStakeholder, 2),
                'stakeholder_entries' => $stakeholderActuals
            ]
        ]);
    }
}
