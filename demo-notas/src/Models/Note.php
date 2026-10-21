<?php

namespace Acme\DemoNotas\Models;

use Illuminate\Database\Eloquent\Model;

class Note extends Model
{
    // Las tablas de un módulo llevan el prefijo m_<key>_.
    protected $table = 'm_demo_notas_notes';

    protected $fillable = ['customer_id', 'user_id', 'user_name', 'body'];
}
