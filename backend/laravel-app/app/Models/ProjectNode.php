<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProjectNode extends Model
{
    use SoftDeletes;

    protected $table = 'project_nodes';
    protected $primaryKey = 'node_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'node_id',
        'project_id',
        'parent_node_id',
        'level_type',
        'name',
        'created_by',
        'updated_by',
        'deleted_by'
    ];

    /**
     * Get the project that owns the node.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class, 'project_id', 'project_id');
    }

    /**
     * Get the parent node of this node.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(ProjectNode::class, 'parent_node_id', 'node_id');
    }

    /**
     * Get the child nodes of this node.
     */
    public function children(): HasMany
    {
        return $this->hasMany(ProjectNode::class, 'parent_node_id', 'node_id');
    }

    /**
     * Get the indicators associated with this node.
     */
    public function indicators(): HasMany
    {
        return $this->hasMany(Indicator::class, 'associated_project_node_id', 'node_id');
    }
}
