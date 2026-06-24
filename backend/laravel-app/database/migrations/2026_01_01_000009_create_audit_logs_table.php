<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id('log_id');
            $table->timestamp('timestamp')->useCurrent();
            $table->string('username', 100);
            $table->string('action', 50); // LOGIN, CREATE, UPDATE, APPROVE, SYNC
            $table->string('entity', 50);  // Indicator, Actual Data, Node, etc.
            $table->text('details');
            
            // Standard audit columns
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
