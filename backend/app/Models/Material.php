<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Material extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description'];

    public function schedules()
    {
        return $this->belongsToMany(Schedule::class)
            ->withPivot('quantity_kg')
            ->withTimestamps();
    }
}
