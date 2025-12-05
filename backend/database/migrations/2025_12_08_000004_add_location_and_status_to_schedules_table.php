<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('schedules', function (Blueprint $table) {
            $table->string('pickup_address_text')->nullable();
            $table->decimal('pickup_lat', 10, 7)->nullable();
            $table->decimal('pickup_lng', 10, 7)->nullable();
        });

        // Ajusta enum de status para incluir on_route
        DB::statement("ALTER TABLE schedules MODIFY status ENUM('pending','accepted','on_route','collected','canceled') DEFAULT 'pending'");
    }

    public function down(): void
    {
        // Reverte enum
        DB::statement("ALTER TABLE schedules MODIFY status ENUM('pending','accepted','collected','canceled') DEFAULT 'pending'");

        Schema::table('schedules', function (Blueprint $table) {
            $table->dropColumn(['pickup_address_text', 'pickup_lat', 'pickup_lng']);
        });
    }
};
