<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Framework;
use App\Models\FrameworkNode;
use App\Models\Project;
use App\Models\ProjectNode;
use App\Models\Activity;
use App\Models\ActivityMapping;
use App\Models\Indicator;
use App\Models\IndicatorMetadata;
use App\Models\Target;
use App\Models\ActualData;
use App\Models\AuditLog;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed Projects
        Project::create([
            'project_id' => 'PRJ-001',
            'name' => 'Higher Education Economic Transformation (HEET)',
            'start_year' => 2021,
            'end_year' => 2026,
            'created_by' => 'admin@moe.go.tz'
        ]);

        Project::create([
            'project_id' => 'PRJ-002',
            'name' => 'Secondary Education Quality Improvement Project (SEQUIP)',
            'start_year' => 2020,
            'end_year' => 2025,
            'created_by' => 'admin@moe.go.tz'
        ]);

        // 1.2 Seed Project Nodes
        ProjectNode::create([
            'node_id' => 'PN-101',
            'project_id' => 'PRJ-001',
            'parent_node_id' => null,
            'level_type' => 'Component',
            'name' => 'Infrastructure & Equipment',
            'created_by' => 'admin@moe.go.tz'
        ]);

        ProjectNode::create([
            'node_id' => 'PN-102',
            'project_id' => 'PRJ-001',
            'parent_node_id' => null,
            'level_type' => 'Component',
            'name' => 'Academic Quality & Relevance',
            'created_by' => 'admin@moe.go.tz'
        ]);

        ProjectNode::create([
            'node_id' => 'PN-103',
            'project_id' => 'PRJ-001',
            'parent_node_id' => 'PN-102',
            'level_type' => 'Sub-component',
            'name' => 'Curriculum Modernization',
            'created_by' => 'admin@moe.go.tz'
        ]);

        ProjectNode::create([
            'node_id' => 'PN-201',
            'project_id' => 'PRJ-002',
            'parent_node_id' => null,
            'level_type' => 'Key Result Area',
            'name' => 'Safe Secondary Schools',
            'created_by' => 'admin@moe.go.tz'
        ]);

        ProjectNode::create([
            'node_id' => 'PN-202',
            'project_id' => 'PRJ-002',
            'parent_node_id' => null,
            'level_type' => 'Key Result Area',
            'name' => 'Teacher Development & Deployment',
            'created_by' => 'admin@moe.go.tz'
        ]);

        // 1. Seed Frameworks
        Framework::create([
            'framework_id' => 'FW-001',
            'name' => 'Education Sector Development Plan (ESDP III)',
            'start_year' => 2024,
            'end_year' => 2029,
            'created_by' => 'admin@moe.go.tz'
        ]);

        Framework::create([
            'framework_id' => 'FW-002',
            'name' => 'Sustainable Development Goals (SDG 4)',
            'start_year' => 2015,
            'end_year' => 2030,
            'created_by' => 'admin@moe.go.tz'
        ]);

        Framework::create([
            'framework_id' => 'FW-003',
            'name' => 'National Development Vision 2050',
            'start_year' => 2025,
            'end_year' => 2050,
            'created_by' => 'admin@moe.go.tz'
        ]);

        // 2. Seed Framework Nodes
        FrameworkNode::create([
            'node_id' => 'N-101',
            'framework_id' => 'FW-001',
            'parent_node_id' => null,
            'level_type' => 'Sub-sector',
            'name' => 'Primary Education',
            'created_by' => 'admin@moe.go.tz'
        ]);

        FrameworkNode::create([
            'node_id' => 'N-102',
            'framework_id' => 'FW-001',
            'parent_node_id' => null,
            'level_type' => 'Sub-sector',
            'name' => 'Secondary Education',
            'created_by' => 'admin@moe.go.tz'
        ]);

        FrameworkNode::create([
            'node_id' => 'N-103',
            'framework_id' => 'FW-001',
            'parent_node_id' => null,
            'level_type' => 'Sub-sector',
            'name' => 'Teacher Education & Training',
            'created_by' => 'admin@moe.go.tz'
        ]);

        FrameworkNode::create([
            'node_id' => 'N-104',
            'framework_id' => 'FW-001',
            'parent_node_id' => 'N-101',
            'level_type' => 'Focus Area',
            'name' => 'Access & Equity in Primary',
            'created_by' => 'admin@moe.go.tz'
        ]);

        FrameworkNode::create([
            'node_id' => 'N-105',
            'framework_id' => 'FW-001',
            'parent_node_id' => 'N-101',
            'level_type' => 'Focus Area',
            'name' => 'Quality of Primary Learning',
            'created_by' => 'admin@moe.go.tz'
        ]);

        // SDG 4 Nodes
        FrameworkNode::create([
            'node_id' => 'N-201',
            'framework_id' => 'FW-002',
            'parent_node_id' => null,
            'level_type' => 'Target',
            'name' => 'Target 4.1: Free, equitable & quality primary/secondary',
            'created_by' => 'admin@moe.go.tz'
        ]);

        FrameworkNode::create([
            'node_id' => 'N-202',
            'framework_id' => 'FW-002',
            'parent_node_id' => null,
            'level_type' => 'Target',
            'name' => 'Target 4.c: Increase supply of qualified teachers',
            'created_by' => 'admin@moe.go.tz'
        ]);

        // 3. Seed Activities
        Activity::create([
            'activity_id' => 'ACT-001',
            'name' => 'Construction of classrooms in underserved councils',
            'description' => 'Build 1,200 classrooms in target primary and secondary schools across rural districts.',
            'start_date' => '2024-07-01',
            'end_date' => '2026-06-30',
            'budget' => 15000000.00,
            'owner_unit' => 'Primary Education Division',
            'created_by' => 'admin@moe.go.tz'
        ]);

        Activity::create([
            'activity_id' => 'ACT-002',
            'name' => 'In-service teacher training on new curriculum',
            'description' => 'Train 15,000 primary school teachers on the revised competency-based curriculum.',
            'start_date' => '2024-09-15',
            'end_date' => '2025-12-31',
            'budget' => 8500000.00,
            'owner_unit' => 'Teacher Education Division',
            'created_by' => 'admin@moe.go.tz'
        ]);

        Activity::create([
            'activity_id' => 'ACT-003',
            'name' => 'Distribution of STEM laboratory kits',
            'description' => 'Procure and distribute science lab kits to 600 secondary schools.',
            'start_date' => '2025-01-10',
            'end_date' => '2025-11-30',
            'budget' => 5200000.00,
            'owner_unit' => 'Secondary Education Division',
            'created_by' => 'admin@moe.go.tz'
        ]);

        Activity::create([
            'activity_id' => 'ACT-004',
            'name' => 'School QA Inspections and Audits',
            'description' => 'Conduct inspectoral visits to primary and secondary schools.',
            'start_date' => '2024-07-01',
            'end_date' => '2029-06-30',
            'budget' => 3000000.00,
            'owner_unit' => 'School Quality Assurance Division',
            'created_by' => 'admin@moe.go.tz'
        ]);

        // 4. Activity Mappings
        ActivityMapping::create([
            'mapping_id' => 'MAP-001',
            'activity_id' => 'ACT-001',
            'node_id' => 'N-104',
            'created_by' => 'admin@moe.go.tz'
        ]);

        ActivityMapping::create([
            'mapping_id' => 'MAP-002',
            'activity_id' => 'ACT-002',
            'node_id' => 'N-105',
            'created_by' => 'admin@moe.go.tz'
        ]);

        ActivityMapping::create([
            'mapping_id' => 'MAP-003',
            'activity_id' => 'ACT-003',
            'node_id' => 'N-102',
            'created_by' => 'admin@moe.go.tz'
        ]);

        ActivityMapping::create([
            'mapping_id' => 'MAP-004',
            'activity_id' => 'ACT-004',
            'node_id' => 'N-105',
            'created_by' => 'admin@moe.go.tz'
        ]);

        // 5. Seed Indicators
        Indicator::create([
            'indicator_id' => 'IND-001',
            'name' => 'Net Enrollment Rate (NER) - Primary',
            'type' => 'Outcome',
            'is_derived' => false,
            'associated_node_id' => 'N-104',
            'associated_project_node_id' => 'PN-101',
            'associated_activity_id' => 'ACT-001',
            'created_by' => 'admin@moe.go.tz'
        ]);

        Indicator::create([
            'indicator_id' => 'IND-002',
            'name' => 'Pupil-Teacher Ratio (PTR) - Primary',
            'type' => 'Output',
            'is_derived' => false,
            'associated_node_id' => 'N-105',
            'associated_project_node_id' => 'PN-202',
            'associated_activity_id' => 'ACT-002',
            'created_by' => 'admin@moe.go.tz'
        ]);

        Indicator::create([
            'indicator_id' => 'IND-003',
            'name' => 'Primary Education Completion Rate',
            'type' => 'Outcome',
            'is_derived' => true,
            'formula' => '{"calc": "graduates / total_final_year_enrollment * 100"}',
            'associated_node_id' => 'N-101',
            'associated_activity_id' => null,
            'created_by' => 'admin@moe.go.tz'
        ]);

        Indicator::create([
            'indicator_id' => 'IND-004',
            'name' => 'Percentage of Schools Inspected Annually',
            'type' => 'Output',
            'is_derived' => false,
            'associated_node_id' => 'N-105',
            'associated_activity_id' => 'ACT-004',
            'created_by' => 'admin@moe.go.tz'
        ]);

        // 6. Seed Metadata
        IndicatorMetadata::create([
            'indicator_id' => 'IND-001',
            'unit' => 'Percentage (%)',
            'frequency' => 'Annually',
            'data_source' => 'ESMIS / School Registry',
            'verification_means' => 'Annual Census Report',
            'responsible_unit' => 'Primary Education Division',
            'created_by' => 'admin@moe.go.tz'
        ]);

        IndicatorMetadata::create([
            'indicator_id' => 'IND-002',
            'unit' => 'Ratio (Pupils per Teacher)',
            'frequency' => 'Quarterly',
            'data_source' => 'SAS Teacher Registry',
            'verification_means' => 'HR Personnel Records',
            'responsible_unit' => 'Teacher Education Division',
            'created_by' => 'admin@moe.go.tz'
        ]);

        IndicatorMetadata::create([
            'indicator_id' => 'IND-003',
            'unit' => 'Percentage (%)',
            'frequency' => 'Annually',
            'data_source' => 'NECTA Exam Registry',
            'verification_means' => 'NECTA Graduation Release Booklet',
            'responsible_unit' => 'Secondary Education Division',
            'created_by' => 'admin@moe.go.tz'
        ]);

        IndicatorMetadata::create([
            'indicator_id' => 'IND-004',
            'unit' => 'Percentage (%)',
            'frequency' => 'Quarterly',
            'data_source' => 'SQAS Inspection Portal',
            'verification_means' => 'SQA Inspector Reports',
            'responsible_unit' => 'School Quality Assurance Division',
            'created_by' => 'admin@moe.go.tz'
        ]);

        // 7. Seed Targets
        $regions = ['Dodoma', 'Dar es Salaam', 'Mwanza', 'Arusha', 'Mbeya'];
        $targetsConfig = [
            'IND-001' => [
                'baseline' => [90.5, 94.0, 91.0, 89.8, 92.3],
                'target' => [92.0, 96.5, 94.0, 93.0, 95.0]
            ],
            'IND-002' => [
                'baseline' => [55.0, 48.0, 58.0, 46.0, 50.0],
                'target' => [45.0, 42.0, 48.0, 40.0, 43.0]
            ],
            'IND-003' => [
                'baseline' => [74.0, 86.5, 78.5, 80.0, 82.0],
                'target' => [80.0, 90.0, 84.0, 85.0, 88.0]
            ],
            'IND-004' => [
                'baseline' => [48.0, 65.0, 52.0, 50.0, 55.0],
                'target' => [75.0, 80.0, 75.0, 70.0, 75.0]
            ]
        ];

        foreach ($targetsConfig as $indicatorId => $config) {
            foreach ($regions as $index => $regionName) {
                $uniqueId = 'TGT-' . str_pad(rand(10, 9999), 4, '0', STR_PAD_LEFT);
                Target::create([
                    'target_id' => $uniqueId,
                    'indicator_id' => $indicatorId,
                    'framework_id' => 'FW-001',
                    'financial_year' => '2024/25',
                    'target_type' => 'Regional',
                    'region' => $regionName,
                    'baseline_year' => '2023',
                    'baseline_value' => $config['baseline'][$index],
                    'target_value' => $config['target'][$index],
                    'created_by' => 'admin@moe.go.tz'
                ]);
            }
        }

        // 8. Seed Actual Data
        $actualsData = [
            // IND-001
            ['DAT-001', 'IND-001', '2024/25', 95.80, 'Dar es Salaam', 'Ilala', 'deo.dar@moe.go.tz', 'Official_Gov', 'Approved'],
            ['DAT-002', 'IND-001', '2024/25', 89.20, 'Dodoma', 'Dodoma Municipal', 'deo.dodoma@moe.go.tz', 'Official_Gov', 'Approved'],
            ['DAT-003', 'IND-001', '2024/25', 91.50, 'Mwanza', 'Nyamagana', 'deo.mwanza@moe.go.tz', 'Official_Gov', 'Verified'],
            ['DAT-004', 'IND-001', '2024/25', 92.40, 'Arusha', 'Arusha City', 'deo.arusha@moe.go.tz', 'Official_Gov', 'Approved'],
            ['DAT-005', 'IND-001', '2024/25', 94.60, 'Mbeya', 'Mbeya City', 'deo.mbeya@moe.go.tz', 'Official_Gov', 'Submitted'],
            
            // IND-002
            ['DAT-006', 'IND-002', '2024/25 Q3', 43.00, 'Dar es Salaam', 'Kinondoni', 'reo.dar@moe.go.tz', 'Official_Gov', 'Approved'],
            ['DAT-007', 'IND-002', '2024/25 Q3', 49.00, 'Dodoma', 'Bahi', 'reo.dodoma@moe.go.tz', 'Official_Gov', 'Approved'],
            ['DAT-008', 'IND-002', '2024/25 Q3', 51.00, 'Mwanza', 'Sengerema', 'reo.mwanza@moe.go.tz', 'Official_Gov', 'Approved'],
            ['DAT-009', 'IND-002', '2024/25 Q3', 41.50, 'Arusha', 'Meru', 'reo.arusha@moe.go.tz', 'Official_Gov', 'Approved'],
            ['DAT-010', 'IND-002', '2024/25 Q3', 44.20, 'Mbeya', 'Rungwe', 'reo.mbeya@moe.go.tz', 'Official_Gov', 'Approved'],

            // IND-003
            ['DAT-011', 'IND-003', '2024/25', 88.20, 'Dar es Salaam', 'Ilala', 'reo.dar@moe.go.tz', 'Official_Gov', 'Approved'],
            ['DAT-012', 'IND-003', '2024/25', 76.50, 'Dodoma', 'Dodoma', 'reo.dodoma@moe.go.tz', 'Official_Gov', 'Approved'],
            ['DAT-013', 'IND-003', '2024/25', 81.00, 'Mwanza', 'Nyamagana', 'reo.mwanza@moe.go.tz', 'Official_Gov', 'Verified'],

            // IND-004
            ['DAT-014', 'IND-004', '2024/25 Q3', 70.00, 'Dar es Salaam', null, 'sqa.dar@moe.go.tz', 'Official_Gov', 'Approved'],
            ['DAT-015', 'IND-004', '2024/25 Q3', 58.00, 'Dodoma', null, 'sqa.dodoma@moe.go.tz', 'Official_Gov', 'Approved'],

            // Stakeholder Contributions
            ['DAT-101', 'IND-001', '2024/25', 2.10, 'Dodoma', 'Bahi', 'ngo.worldvision@charity.org', 'Stakeholder_Contribution', 'Approved'],
            ['DAT-102', 'IND-001', '2024/25', 3.40, 'Dar es Salaam', 'Kinondoni', 'ngo.savechildren@charity.org', 'Stakeholder_Contribution', 'Approved'],
            ['DAT-103', 'IND-002', '2024/25 Q3', 12.00, 'Dodoma', 'Bahi', 'ngo.actionaid@charity.org', 'Stakeholder_Contribution', 'Approved'],
        ];

        foreach ($actualsData as $d) {
            ActualData::create([
                'data_id' => $d[0],
                'indicator_id' => $d[1],
                'period' => $d[2],
                'actual_value' => $d[3],
                'region' => $d[4],
                'district' => $d[5],
                'submitted_by' => $d[6],
                'source_category' => $d[7],
                'date_submitted' => now(),
                'status' => $d[8],
                'created_by' => $d[6]
            ]);
        }

        // 9. Audit Logs
        AuditLog::create([
            'timestamp' => now(),
            'username' => 'admin@moe.go.tz',
            'action' => 'CREATE',
            'entity' => 'Indicator',
            'details' => 'Initialized M&E indicator configurations and baseline regional targets.'
        ]);
    }
}
