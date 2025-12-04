<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('schedules', function (Blueprint $table) {
            $table->id();

            // donor
            $table->foreignId('user_id')->constrained('users');

            // collector (nullable until accepted)
            $table->foreignId('collector_id')->nullable()->constrained('users');

            $table->enum('status', ['pending','accepted','collected','canceled'])->default('pending');
            $table->dateTime('scheduled_at')->nullable();
            $table->string('place')->nullable();
            $table->text('notes')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schedules');
    }
};
