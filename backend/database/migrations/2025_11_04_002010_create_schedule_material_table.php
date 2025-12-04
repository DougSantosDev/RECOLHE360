<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('material_schedule', function (Blueprint $table) {
            $table->id();
            $table->foreignId('schedule_id')->constrained('schedules')->cascadeOnDelete();
            $table->foreignId('material_id')->constrained('materials')->cascadeOnDelete();
            $table->decimal('quantity_kg', 10, 2)->default(0);
            $table->timestamps();

            $table->unique(['schedule_id','material_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('material_schedule');
    }
};
