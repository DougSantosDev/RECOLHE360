<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        $map = [
            ['from' => 'Paper',       'to' => 'Papel',        'description' => 'Jornais, cadernos, papel de escritório'],
            ['from' => 'Plastic',     'to' => 'Plástico',     'description' => 'Garrafas PET e embalagens'],
            ['from' => 'Glass',       'to' => 'Vidro',        'description' => 'Garrafas e potes'],
            ['from' => 'Metal',       'to' => 'Metal',        'description' => 'Alumínio, latas e sucata leve'],
            ['from' => 'Electronics', 'to' => 'Eletrônicos',  'description' => 'Aparelhos pequenos e cabos'],
        ];

        foreach ($map as $m) {
            DB::table('materials')
                ->where('name', $m['from'])
                ->update([
                    'name' => $m['to'],
                    'description' => $m['description'],
                ]);
        }
    }

    public function down(): void
    {
        $map = [
            ['from' => 'Papel',       'to' => 'Paper',       'description' => 'Newspapers, notebooks, office paper'],
            ['from' => 'Plástico',    'to' => 'Plastic',     'description' => 'PET bottles, packaging'],
            ['from' => 'Vidro',       'to' => 'Glass',       'description' => 'Bottles, jars'],
            ['from' => 'Metal',       'to' => 'Metal',       'description' => 'Aluminum, cans'],
            ['from' => 'Eletrônicos', 'to' => 'Electronics', 'description' => 'Small devices, cables'],
        ];

        foreach ($map as $m) {
            DB::table('materials')
                ->where('name', $m['from'])
                ->update([
                    'name' => $m['to'],
                    'description' => $m['description'],
                ]);
        }
    }
};
