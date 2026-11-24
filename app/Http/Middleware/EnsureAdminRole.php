<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminRole
{
    public function handle(Request $request, Closure $next, string $scope = 'staff'): Response
    {
        $user = $request->user();
        if (! $user || $user->status !== 'active') {
            abort(403, 'Authentication required.');
        }

        if ($scope === 'admin' && $user->role !== 'admin') {
            abort(403, 'Administrator privileges required.');
        }

        if ($scope === 'staff' && ! in_array($user->role, ['admin', 'moderator'], true)) {
            abort(403, 'Staff authorization required.');
        }

        return $next($request);
    }
}
