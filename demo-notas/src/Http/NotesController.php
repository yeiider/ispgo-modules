<?php

namespace Acme\DemoNotas\Http;

use Acme\DemoNotas\Models\Note;
use App\Models\Customers\Customer;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class NotesController extends Controller
{
    /** Quién abrió el módulo (lo pone el middleware module.session). */
    public function me(Request $request)
    {
        return ['id' => $request->user()->id, 'name' => $request->user()->name];
    }

    /** Búsqueda de clientes del núcleo, para mostrar que el módulo los lee. */
    public function customers(Request $request)
    {
        $q = trim((string) $request->query('q'));

        return Customer::query()
            ->when($q !== '', fn ($query) => $query->where(function ($query) use ($q) {
                $query->where('first_name', 'like', "%{$q}%")
                    ->orWhere('last_name', 'like', "%{$q}%")
                    ->orWhere('identity_document', 'like', "%{$q}%");
            }))
            ->orderBy('first_name')
            ->limit(10)
            ->get(['id', 'first_name', 'last_name', 'identity_document']);
    }

    public function index(Request $request)
    {
        return Note::query()
            ->when($request->query('customer_id'), fn ($query, $id) => $query->where('customer_id', $id))
            ->latest()
            ->limit(100)
            ->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'customer_id' => ['nullable', 'integer'],
            'body' => ['required', 'string', 'max:2000'],
        ]);

        return Note::create($data + [
            'user_id' => $request->user()->id,
            'user_name' => $request->user()->name,
        ]);
    }

    public function destroy(Note $note)
    {
        $note->delete();

        return response()->noContent();
    }
}
