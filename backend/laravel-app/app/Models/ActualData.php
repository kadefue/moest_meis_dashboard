<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActualData extends Model
{
    use SoftDeletes;

    protected $table = 'actual_data';
    protected $primaryKey = 'data_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'data_id',
        'indicator_id',
        'period',
        'actual_value',
        'region',
        'district',
        'ward',
        'submitted_by',
        'source_category',
        'date_submitted',
        'status',
        'created_by',
        'updated_by',
        'deleted_by'
    ];

    /**
     * Get the indicator related to this actual submission.
     */
    public function indicator(): BelongsTo
    {
        return $this->belongsTo(Indicator::class, 'indicator_id', 'indicator_id');
    }
}
