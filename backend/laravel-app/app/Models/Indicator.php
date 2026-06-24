<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Indicator extends Model
{
    use SoftDeletes;

    protected $table = 'indicators';
    protected $primaryKey = 'indicator_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'indicator_id',
        'name',
        'type',
        'is_derived',
        'formula',
        'associated_node_id',
        'associated_project_node_id',
        'associated_activity_id',
        'created_by',
        'updated_by',
        'deleted_by'
    ];

    /**
     * Get the metadata linked to the indicator (1:1 relation).
     */
    public function metadata(): HasOne
    {
        return $this->hasOne(IndicatorMetadata::class, 'indicator_id', 'indicator_id');
    }

    /**
     * Get the framework node that this indicator belongs to.
     */
    public function node(): BelongsTo
    {
        return $this->belongsTo(FrameworkNode::class, 'associated_node_id', 'node_id');
    }

    /**
     * Get the project node that this indicator belongs to.
     */
    public function projectNode(): BelongsTo
    {
        return $this->belongsTo(ProjectNode::class, 'associated_project_node_id', 'node_id');
    }

    /**
     * Get the activity related to this indicator.
     */
    public function activity(): BelongsTo
    {
        return $this->belongsTo(Activity::class, 'associated_activity_id', 'activity_id');
    }

    /**
     * Get the targets configured for this indicator.
     */
    public function targets(): HasMany
    {
        return $this->hasMany(Target::class, 'indicator_id', 'indicator_id');
    }

    /**
     * Get the actual logs recorded for this indicator.
     */
    public function actuals(): HasMany
    {
        return $this->hasMany(ActualData::class, 'indicator_id', 'indicator_id');
    }
}
