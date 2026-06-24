<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_mappings', function (Blueprint $table) {
            $table->string('mapping_id', 10)->primary();
            $table->string('activity_id', 10);
            $table->string('node_id', 10);
            
            // Audit columns
            $table->string('created_by')->nullable();
            $table->string('updated_by')->nullable();
            $table->string('deleted_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Foreign keys
            $table->foreign('activity_id')->references('activity_id')->on('activities')->onDelete('cascade');
            $table->foreign('node_id')->references('node_id')->on('framework_nodes')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_mappings');
    }
};
