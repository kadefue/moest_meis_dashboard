<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Framework extends Model
{
    use SoftDeletes;

    protected $table = 'frameworks';
    protected $primaryKey = 'framework_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'framework_id',
        'name',
        'start_year',
        'end_year',
        'created_by',
        'updated_by',
        'deleted_by'
    ];

    /**
     * Get the nodes associated with the framework.
     */
    public function nodes(): HasMany
    {
        return $this->hasMany(FrameworkNode::class, 'framework_id', 'framework_id');
    }

    /**
     * Get the targets associated with this framework.
     */
    public function targets(): HasMany
    {
        return $this->hasMany(Target::class, 'framework_id', 'framework_id');
    }
}
