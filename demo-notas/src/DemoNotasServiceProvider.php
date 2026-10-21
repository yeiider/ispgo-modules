<?php

namespace Acme\DemoNotas;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

/**
 * IspGo registra este provider solo si el módulo está activo. Las rutas van
 * bajo /api/m/demo-notas y las protege la sesión corta del módulo
 * (module.session:demo-notas), nunca el token del usuario.
 */
class DemoNotasServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        Route::prefix('api/m/demo-notas')
            ->middleware(['api', 'module.session:demo-notas'])
            ->group(__DIR__.'/../routes/api.php');
    }
}
