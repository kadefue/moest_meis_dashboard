<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Create projects table
        Schema::create('projects', function (Blueprint $table) {
            $table->string('project_id', 10)->primary();
            $table->string('name', 255);
            $table->integer('start_year');
            $table->integer('end_year');
            $table->string('created_by')->nullable();
            $table->string('updated_by')->nullable();
            $table->string('deleted_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // 2. Create project_nodes table
        Schema::create('project_nodes', function (Blueprint $table) {
            $table->string('node_id', 10)->primary();
            $table->string('project_id', 10);
            $table->string('parent_node_id', 10)->nullable();
            $table->string('level_type', 50);
            $table->string('name', 255);
            $table->string('created_by')->nullable();
            $table->string('updated_by')->nullable();
            $table->string('deleted_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('project_id')->references('project_id')->on('projects')->onDelete('cascade');
            $table->foreign('parent_node_id')->references('node_id')->on('project_nodes')->onDelete('set null');
        });

        // 3. Add associated_project_node_id column to indicators table
        Schema::table('indicators', function (Blueprint $table) {
            $table->string('associated_project_node_id', 10)->nullable()->after('associated_node_id');
            $table->foreign('associated_project_node_id')->references('node_id')->on('project_nodes')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('indicators', function (Blueprint $table) {
            $table->dropForeign(['associated_project_node_id']);
            $table->dropColumn('associated_project_node_id');
        });

        Schema::dropIfExists('project_nodes');
        Schema::dropIfExists('projects');
    }
};
