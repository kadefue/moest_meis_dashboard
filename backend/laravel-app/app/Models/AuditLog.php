<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    protected $table = 'audit_logs';
    protected $primaryKey = 'log_id';

    protected $fillable = [
        'timestamp',
        'username',
        'action',
        'entity',
        'details'
    ];

    // Disable standard updated_at/created_at since we use custom timestamp
    public $timestamps = true;
}
