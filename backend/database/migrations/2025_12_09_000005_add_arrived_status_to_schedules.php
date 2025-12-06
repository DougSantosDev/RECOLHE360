<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        DB::statement("ALTER TABLE schedules MODIFY status ENUM('pending','accepted','on_route','arrived','collected','canceled') DEFAULT 'pending'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE schedules MODIFY status ENUM('pending','accepted','on_route','collected','canceled') DEFAULT 'pending'");
    }
};
