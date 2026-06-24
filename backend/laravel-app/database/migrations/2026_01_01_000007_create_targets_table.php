<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('targets', function (Blueprint $table) {
            $table->string('target_id', 10)->primary();
            $table->string('indicator_id', 10);
            $table->string('framework_id', 10);
            $table->string('financial_year', 20);
            $table->string('target_type', 50);
            $table->string('region', 100);
            $table->string('district', 100)->nullable();
            $table->string('ward', 100)->nullable();
            $table->string('baseline_year', 20);
            $table->decimal('baseline_value', 12, 2);
            $table->decimal('target_value', 12, 2);
            
            // Audit columns
            $table->string('created_by')->nullable();
            $table->string('updated_by')->nullable();
            $table->string('deleted_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Foreign keys
            $table->foreign('indicator_id')->references('indicator_id')->on('indicators')->onDelete('cascade');
            $table->foreign('framework_id')->references('framework_id')->on('frameworks')->onDelete('cascade');
            
            // Composite indexes for performance on geography queries
            $table->index(['indicator_id', 'financial_year', 'region']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('targets');
    }
};
