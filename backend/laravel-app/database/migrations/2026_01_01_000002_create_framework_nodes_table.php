<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('framework_nodes', function (Blueprint $table) {
            $table->string('node_id', 10)->primary();
            $table->string('framework_id', 10);
            $table->string('parent_node_id', 10)->nullable();
            $table->string('level_type', 50);
            $table->string('name', 255);
            
            // Audit columns
            $table->string('created_by')->nullable();
            $table->string('updated_by')->nullable();
            $table->string('deleted_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Foreign keys
            $table->foreign('framework_id')->references('framework_id')->on('frameworks')->onDelete('cascade');
            $table->foreign('parent_node_id')->references('node_id')->on('framework_nodes')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('framework_nodes');
    }
};
