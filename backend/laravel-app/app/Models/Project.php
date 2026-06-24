<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    use SoftDeletes;

    protected $table = 'projects';
    protected $primaryKey = 'project_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'project_id',
        'name',
        'start_year',
        'end_year',
        'created_by',
        'updated_by',
        'deleted_by'
    ];

    /**
     * Get the nodes associated with the project.
     */
    public function nodes(): HasMany
    {
        return $this->hasMany(ProjectNode::class, 'project_id', 'project_id');
    }
}
