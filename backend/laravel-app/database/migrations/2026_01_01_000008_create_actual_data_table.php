<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('actual_data', function (Blueprint $table) {
            $table->string('data_id', 10)->primary();
            $table->string('indicator_id', 10);
            $table->string('period', 20);
            $table->decimal('actual_value', 12, 2);
            $table->string('region', 100);
            $table->string('district', 100)->nullable();
            $table->string('ward', 100)->nullable();
            $table->string('submitted_by', 100);
            $table->string('source_category', 50);
            $table->timestamp('date_submitted');
            $table->string('status', 20); // Submitted, Verified, Approved
            
            // Audit columns
            $table->string('created_by')->nullable();
            $table->string('updated_by')->nullable();
            $table->string('deleted_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Foreign keys
            $table->foreign('indicator_id')->references('indicator_id')->on('indicators')->onDelete('cascade');

            // Indexing for faster aggregation
            $table->index(['indicator_id', 'period', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('actual_data');
    }
};
