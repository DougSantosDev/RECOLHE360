<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Material;

class MaterialSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            ['name' => 'Papel',        'description' => 'Jornais, cadernos, papel de escritório'],
            ['name' => 'Plástico',     'description' => 'Garrafas PET e embalagens'],
            ['name' => 'Vidro',        'description' => 'Garrafas e potes'],
            ['name' => 'Metal',        'description' => 'Alumínio, latas e sucata leve'],
            ['name' => 'Eletrônicos',  'description' => 'Aparelhos pequenos e cabos'],
        ];

        foreach ($items as $i) {
            // Evita duplicar materiais caso o seeder rode mais de uma vez
            Material::updateOrCreate(
                ['name' => $i['name']],
                ['description' => $i['description']]
            );
        }
    }
}
