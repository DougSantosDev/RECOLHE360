<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Schedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'collector_id',
        'status',
        'scheduled_at',
        'place',
        'notes',
        'pickup_address_text',
        'pickup_lat',
        'pickup_lng',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'pickup_lat' => 'float',
        'pickup_lng' => 'float',
    ];

    public function donor()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function collector()
    {
        return $this->belongsTo(User::class, 'collector_id');
    }

    public function materials()
    {
        return $this->belongsToMany(Material::class)
            ->withPivot('quantity_kg')
            ->withTimestamps();
    }

    public function locations()
    {
        return $this->hasMany(ScheduleLocation::class);
    }

    public function latestLocation()
    {
        return $this->hasOne(ScheduleLocation::class)->latestOfMany('recorded_at');
    }
}
