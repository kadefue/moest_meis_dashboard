<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Activity extends Model
{
    use SoftDeletes;

    protected $table = 'activities';
    protected $primaryKey = 'activity_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'activity_id',
        'name',
        'description',
        'start_date',
        'end_date',
        'budget',
        'owner_unit',
        'created_by',
        'updated_by',
        'deleted_by'
    ];

    /**
     * Get the framework nodes that this activity maps to.
     */
    public function nodes(): BelongsToMany
    {
        return $this->belongsToMany(
            FrameworkNode::class,
            'activity_mappings',
            'activity_id',
            'node_id',
            'activity_id',
            'node_id'
        )->withPivot('mapping_id');
    }

    /**
     * Get the indicators tied directly to this activity.
     */
    public function indicators(): HasMany
    {
        return $this->hasMany(Indicator::class, 'associated_activity_id', 'activity_id');
    }
}
