<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('indicators', function (Blueprint $table) {
            $table->string('indicator_id', 10)->primary();
            $table->string('name', 255);
            $table->string('type', 50);
            $table->boolean('is_derived')->default(false);
            $table->text('formula')->nullable();
            $table->string('associated_node_id', 10)->nullable();
            $table->string('associated_activity_id', 10)->nullable();
            
            // Audit columns
            $table->string('created_by')->nullable();
            $table->string('updated_by')->nullable();
            $table->string('deleted_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Foreign keys
            $table->foreign('associated_node_id')->references('node_id')->on('framework_nodes')->onDelete('set null');
            $table->foreign('associated_activity_id')->references('activity_id')->on('activities')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('indicators');
    }
};
