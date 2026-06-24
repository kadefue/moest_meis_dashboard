<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('indicator_metadata', function (Blueprint $table) {
            $table->string('indicator_id', 10)->primary();
            $table->string('unit', 50);
            $table->string('frequency', 50);
            $table->string('data_source', 150);
            $table->string('verification_means', 255);
            $table->string('responsible_unit', 100);
            
            // Audit columns
            $table->string('created_by')->nullable();
            $table->string('updated_by')->nullable();
            $table->string('deleted_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Foreign key (1:1 constraint via primary key link)
            $table->foreign('indicator_id')->references('indicator_id')->on('indicators')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('indicator_metadata');
    }
};
