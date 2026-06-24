<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IndicatorMetadata extends Model
{
    use SoftDeletes;

    protected $table = 'indicator_metadata';
    protected $primaryKey = 'indicator_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'indicator_id',
        'unit',
        'frequency',
        'data_source',
        'verification_means',
        'responsible_unit',
        'created_by',
        'updated_by',
        'deleted_by'
    ];

    /**
     * Get the indicator related to this metadata record.
     */
    public function indicator(): BelongsTo
    {
        return $this->belongsTo(Indicator::class, 'indicator_id', 'indicator_id');
    }
}
