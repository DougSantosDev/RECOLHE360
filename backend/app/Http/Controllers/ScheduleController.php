<?php

namespace App\Http\Controllers;

use App\Models\Schedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ScheduleController extends Controller
{
    // List general schedules (optionally filter by status)
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Schedule::with(['donor:id,name', 'collector:id,name', 'materials'])
            ->orderByDesc('id');

        // Regra de acesso por perfil
        if ($user->role === 'donor') {
            $query->where('user_id', $user->id);
        } elseif ($user->role === 'collector') {
            // Coletor lista pendentes (sem coletor) ou suas próprias
            if ($request->query('status') === 'pending') {
                $query->where('status', 'pending')->whereNull('collector_id');
            } else {
                $query->where('collector_id', $user->id);
                if ($request->query('status')) {
                    $query->where('status', $request->query('status'));
                }
            }
        } else {
            // admin pode filtrar por status
            if ($request->query('status')) {
                $query->where('status', $request->query('status'));
            }
        }

        return $query->paginate(20);
    }

    // Donor creates a schedule
    public function store(Request $request)
    {
        $user = $request->user();
        if (!in_array($user->role, ['donor', 'admin'])) {
            return response()->json(['ok' => false, 'message' => 'Only donors or admin can create schedules'], 403);
        }

        $data = $request->validate([
            'scheduled_at'            => 'required|date',
            'notes'                   => 'nullable|string',
            'use_profile_address'     => 'nullable|boolean',
            'pickup_address_text'     => 'nullable|string|max:500',
            'pickup_lat'              => 'nullable|numeric',
            'pickup_lng'              => 'nullable|numeric',
            'notes'                   => 'nullable|string',
            'materials'               => 'required|array|min:1',
            'materials.*.id'          => 'required|exists:materials,id',
            'materials.*.quantity_kg' => 'required|numeric|min:0.1',
        ]);

        // Se solicitado, usa o endereco do perfil
        if (!empty($data['use_profile_address'])) {
            if (!$user->address_street) {
                return response()->json(['ok' => false, 'message' => 'Complete seu endereco no perfil antes de usar o endereco padrao.'], 422);
            }
            $addr = trim(sprintf(
                '%s, %s - %s, %s - %s, %s',
                $user->address_street,
                $user->address_number,
                $user->address_neighborhood,
                $user->address_city,
                $user->address_state,
                $user->address_zip
            ));
            $data['pickup_address_text'] = $addr;
            $data['pickup_lat'] = $user->address_lat;
            $data['pickup_lng'] = $user->address_lng;
        }

        if (empty($data['pickup_address_text'])) {
            return response()->json(['ok' => false, 'message' => 'Informe o local da coleta.'], 422);
        }

        $schedule = Schedule::create([
            'user_id'      => $user->id,
            'status'       => 'pending',
            'scheduled_at' => $data['scheduled_at'] ?? null,
            'place'        => null,
            'pickup_address_text' => $data['pickup_address_text'] ?? null,
            'pickup_lat'   => $data['pickup_lat'] ?? null,
            'pickup_lng'   => $data['pickup_lng'] ?? null,
            'notes'        => $data['notes'] ?? null,
        ]);

        foreach ($data['materials'] as $m) {
            $schedule->materials()->attach($m['id'], ['quantity_kg' => $m['quantity_kg']]);
        }

        return response()->json([
            'ok'        => true,
            'schedule'  => $schedule->load('materials'),
        ], 201);
    }

    // Donor: my schedules
    public function mySchedules(Request $request)
    {
        return $request->user()->schedulesDonations()
            ->with(['materials', 'collector:id,name'])
            ->orderByDesc('id')
            ->get();
    }

    // Collector: schedules I accepted
    public function myCollections(Request $request)
    {
        return $request->user()->schedulesCollections()
            ->with(['materials', 'donor:id,name'])
            ->orderByDesc('id')
            ->get();
    }

    // Collector accepts a schedule
    public function accept(Request $request, Schedule $schedule)
    {
        $user = $request->user();
        if ($user->role !== 'collector') {
            return response()->json(['ok' => false, 'message' => 'Only collectors can accept'], 403);
        }

        // Impede corridas: aceita somente se ainda pendente e sem coletor
        $updated = DB::table('schedules')
            ->where('id', $schedule->id)
            ->whereNull('collector_id')
            ->where('status', 'pending')
            ->update([
                'status'       => 'accepted',
                'collector_id' => $user->id,
                'updated_at'   => now(),
            ]);

        if (!$updated) {
            return response()->json(['ok' => false, 'message' => 'Schedule already taken or not pending'], 422);
        }

        return $schedule->fresh()->load(['materials', 'donor:id,name', 'collector:id,name']);
    }

    // Update status (collector: on_route/collected / donor: canceled)
    public function updateStatus(Request $request, Schedule $schedule)
    {
        $request->validate([
            'status' => 'required|in:on_route,collected,canceled',
        ]);

        $user = $request->user();

        if (in_array($schedule->status, ['collected', 'canceled'])) {
            return response()->json(['ok' => false, 'message' => 'Schedule already closed'], 422);
        }

        if ($request->status === 'on_route') {
            if ($user->id !== $schedule->collector_id) {
                return response()->json(['ok' => false, 'message' => 'Only the assigned collector can mark on route'], 403);
            }
            if ($schedule->status !== 'accepted') {
                return response()->json(['ok' => false, 'message' => 'Schedule must be accepted before on_route'], 422);
            }
        }

        if ($request->status === 'collected') {
            if ($user->id !== $schedule->collector_id) {
                return response()->json(['ok' => false, 'message' => 'Only the assigned collector can complete'], 403);
            }
            if ($schedule->status !== 'accepted') {
                return response()->json(['ok' => false, 'message' => 'Schedule must be accepted before collection'], 422);
            }
        }

        if ($request->status === 'canceled') {
            if ($user->id !== $schedule->user_id && $user->role !== 'admin') {
                return response()->json(['ok' => false, 'message' => 'Only the donor or admin can cancel'], 403);
            }
            if (!in_array($schedule->status, ['pending', 'accepted'])) {
                return response()->json(['ok' => false, 'message' => 'Only pending/accepted schedules can be canceled'], 422);
            }
        }

        $schedule->update(['status' => $request->status]);

        return ['ok' => true, 'schedule' => $schedule];
    }
}
