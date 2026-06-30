<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyApiSignature
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // For development convenience, if key is explicitly empty, we could bypass.
        // But for security, let's enforce it if it's set, or if we expect it.
        $secret = env('API_SECRET_KEY');
        if (!$secret) {
            return response()->json(['error' => 'Server configuration error: API_SECRET_KEY not set'], 500);
        }

        $signature = $request->header('X-Signature');
        $timestamp = $request->header('X-Timestamp');

        if (!$signature || !$timestamp) {
            return response()->json(['error' => 'Missing signature headers'], 401);
        }

        // Prevent replay attacks (5 minute window)
        $timeDiff = time() - (int)$timestamp;
        if (abs($timeDiff) > 300) {
            return response()->json(['error' => 'Request expired'], 401);
        }

        // Generate expected signature
        $body = $request->getContent();
        $dataToSign = $timestamp . $body;
        $expectedSignature = hash_hmac('sha256', $dataToSign, $secret);

        if (!hash_equals($expectedSignature, $signature)) {
            return response()->json(['error' => 'Invalid signature'], 401);
        }

        return $next($request);
    }
}
