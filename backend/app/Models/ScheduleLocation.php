<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ScheduleLocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'schedule_id',
        'collector_id',
        'lat',
        'lng',
        'heading',
        'speed_kmh',
        'recorded_at',
    ];

    protected $casts = [
        'lat' => 'float',
        'lng' => 'float',
        'heading' => 'float',
        'speed_kmh' => 'float',
        'recorded_at' => 'datetime',
    ];

    public function schedule()
    {
        return $this->belongsTo(Schedule::class);
    }

    public function collector()
    {
        return $this->belongsTo(User::class, 'collector_id');
    }
}
