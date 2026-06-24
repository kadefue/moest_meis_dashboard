<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityMapping extends Model
{
    use SoftDeletes;

    protected $table = 'activity_mappings';
    protected $primaryKey = 'mapping_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'mapping_id',
        'activity_id',
        'node_id',
        'created_by',
        'updated_by',
        'deleted_by'
    ];

    /**
     * Get the activity related to this mapping.
     */
    public function activity(): BelongsTo
    {
        return $this->belongsTo(Activity::class, 'activity_id', 'activity_id');
    }

    /**
     * Get the node related to this mapping.
     */
    public function node(): BelongsTo
    {
        return $this->belongsTo(FrameworkNode::class, 'node_id', 'node_id');
    }
}
