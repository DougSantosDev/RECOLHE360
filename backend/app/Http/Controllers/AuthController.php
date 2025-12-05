<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        // Segurança: não permitir auto-registro como admin
        $payload = $request->validate([
            'name'     => 'required|string',
            'email'    => 'required|email|unique:users',
            'password' => 'required|min:6',
            'role'     => 'nullable|in:donor,collector',
            'phone'    => 'nullable|string',
            'address'  => 'nullable|string',
        ]);

        $data = [
            'name'     => $payload['name'],
            'email'    => $payload['email'],
            'password' => Hash::make($payload['password']),
            // padrão seguro: doador, a menos que coletor seja explicitamente solicitado
            'role'     => $payload['role'] ?? 'donor',
            'phone'    => $payload['phone'] ?? null,
            'address'  => $payload['address'] ?? null,
        ];

        $user = User::create($data);

        $token = $user->createToken('mobile')->plainTextToken;

        return response()->json([
            'ok'    => true,
            'user'  => $user,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['ok' => false, 'message' => 'Invalid credentials'], 401);
        }

        $token = $user->createToken('mobile')->plainTextToken;

        return response()->json([
            'ok'    => true,
            'user'  => $user,
            'token' => $token,
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['ok' => true]);
    }

    public function updateAddress(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'address_street'        => 'nullable|string|max:255',
            'address_number'        => 'nullable|string|max:20',
            'address_neighborhood'  => 'nullable|string|max:255',
            'address_city'          => 'nullable|string|max:255',
            'address_state'         => 'nullable|string|max:2',
            'address_zip'           => 'nullable|string|max:10',
            'address_lat'           => 'nullable|numeric',
            'address_lng'           => 'nullable|numeric',
            'phone'                 => 'nullable|string|max:50',
        ]);

        $user->update($data);

        return $user->fresh();
    }
}
