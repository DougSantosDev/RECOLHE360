<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens; // <- Sanctum
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'address',
        'address_street',
        'address_number',
        'address_neighborhood',
        'address_city',
        'address_state',
        'address_zip',
        'address_lat',
        'address_lng',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function schedulesDonations()
    {
        return $this->hasMany(Schedule::class, 'user_id');
    }

    public function schedulesCollections()
    {
        return $this->hasMany(Schedule::class, 'collector_id');
    }
}
