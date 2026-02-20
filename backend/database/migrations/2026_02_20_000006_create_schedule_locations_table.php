<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('schedule_locations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('schedule_id')->constrained('schedules')->cascadeOnDelete();
            $table->foreignId('collector_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('lat', 10, 7);
            $table->decimal('lng', 10, 7);
            $table->decimal('heading', 6, 2)->nullable();
            $table->decimal('speed_kmh', 6, 2)->nullable();
            $table->dateTime('recorded_at');
            $table->timestamps();

            $table->index(['schedule_id', 'recorded_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schedule_locations');
    }
};
