<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class FrameworkNode extends Model
{
    use SoftDeletes;

    protected $table = 'framework_nodes';
    protected $primaryKey = 'node_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'node_id',
        'framework_id',
        'parent_node_id',
        'level_type',
        'name',
        'created_by',
        'updated_by',
        'deleted_by'
    ];

    /**
     * Get the framework that owns the node.
     */
    public function framework(): BelongsTo
    {
        return $this->belongsTo(Framework::class, 'framework_id', 'framework_id');
    }

    /**
     * Get the parent node of this node.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(FrameworkNode::class, 'parent_node_id', 'node_id');
    }

    /**
     * Get the child nodes of this node.
     */
    public function children(): HasMany
    {
        return $this->hasMany(FrameworkNode::class, 'parent_node_id', 'node_id');
    }

    /**
     * Get the activities mapped to this node.
     */
    public function activities(): BelongsToMany
    {
        return $this->belongsToMany(
            Activity::class,
            'activity_mappings',
            'node_id',
            'activity_id',
            'node_id',
            'activity_id'
        )->withPivot('mapping_id');
    }

    /**
     * Get the indicators associated with this node.
     */
    public function indicators(): HasMany
    {
        return $this->hasMany(Indicator::class, 'associated_node_id', 'node_id');
    }
}
