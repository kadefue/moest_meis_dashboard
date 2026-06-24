<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateFrameworksTable extends Migration
{
    public function up()
    {
        Schema::create('frameworks', function (Blueprint $table) {
            $table->string('framework_id', 10)->primary();
            $table->string('name', 255);
            $table->integer('start_year');
            $table->integer('end_year');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::dropIfExists('frameworks');
    }
}

// Drop into: database/migrations/2026_01_01_000000_create_frameworks_table.php
