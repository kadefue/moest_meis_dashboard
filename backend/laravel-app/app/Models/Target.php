<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Target extends Model
{
    use SoftDeletes;

    protected $table = 'targets';
    protected $primaryKey = 'target_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'target_id',
        'indicator_id',
        'framework_id',
        'financial_year',
        'target_type',
        'region',
        'district',
        'ward',
        'baseline_year',
        'baseline_value',
        'target_value',
        'created_by',
        'updated_by',
        'deleted_by'
    ];

    /**
     * Get the indicator related to this target.
     */
    public function indicator(): BelongsTo
    {
        return $this->belongsTo(Indicator::class, 'indicator_id', 'indicator_id');
    }

    /**
     * Get the framework related to this target.
     */
    public function framework(): BelongsTo
    {
        return $this->belongsTo(Framework::class, 'framework_id', 'framework_id');
    }
}
