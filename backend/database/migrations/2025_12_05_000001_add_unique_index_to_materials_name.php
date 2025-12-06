<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Remove duplicados antes de aplicar o índice único
        $dupes = DB::table('materials')
            ->select('name', DB::raw('MIN(id) as keep_id'), DB::raw('GROUP_CONCAT(id) as ids'), DB::raw('COUNT(*) as c'))
            ->groupBy('name')
            ->having('c', '>', 1)
            ->get();

        foreach ($dupes as $dup) {
            $ids = array_filter(array_map('intval', explode(',', $dup->ids)));
            $keepId = (int) $dup->keep_id;
            $toDelete = array_values(array_diff($ids, [$keepId]));

            if (!empty($toDelete)) {
                // Para cada pivot que aponta para materiais duplicados,
                // migra para o material a ser mantido; se já existir a combinação
                // schedule_id + keepId, soma quantidades e remove o duplicado.
                $pivotRows = DB::table('material_schedule')
                    ->whereIn('material_id', $toDelete)
                    ->get();

                foreach ($pivotRows as $pivot) {
                    $existing = DB::table('material_schedule')
                        ->where('schedule_id', $pivot->schedule_id)
                        ->where('material_id', $keepId)
                        ->first();

                    if ($existing) {
                        DB::table('material_schedule')
                            ->where('id', $existing->id)
                            ->update([
                                'quantity_kg' => DB::raw("quantity_kg + {$pivot->quantity_kg}")
                            ]);
                        DB::table('material_schedule')->where('id', $pivot->id)->delete();
                    } else {
                        DB::table('material_schedule')
                            ->where('id', $pivot->id)
                            ->update(['material_id' => $keepId]);
                    }
                }

                DB::table('materials')->whereIn('id', $toDelete)->delete();
            }
        }

        Schema::table('materials', function (Blueprint $table) {
            $table->unique('name');
        });
    }

    public function down(): void
    {
        Schema::table('materials', function (Blueprint $table) {
            $table->dropUnique(['name']);
        });
    }
};
