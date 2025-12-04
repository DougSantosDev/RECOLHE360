<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Doador de teste
        User::updateOrCreate(
            ['email' => 'doador@example.com'],
            [
                'name' => 'Doador Teste',
                'password' => Hash::make('password'),
                'role' => 'donor',
                'phone' => '11 99999-9999',
                'address' => 'Rua A, 123',
            ]
        );

        // Coletor de teste
        User::updateOrCreate(
            ['email' => 'coletor@example.com'],
            [
                'name' => 'Coletor Teste',
                'password' => Hash::make('password'),
                'role' => 'collector',
                'phone' => '11 98888-8888',
                'address' => 'Rua B, 456',
            ]
        );

        // Opcional: admin
        User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('password'),
                'role' => 'admin',
            ]
        );
    }
}

