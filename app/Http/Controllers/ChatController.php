<?php

namespace App\Http\Controllers;

use App\Models\ChatMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ChatController extends Controller
{
    public function index(): JsonResponse
    {
        $messages = ChatMessage::orderBy('created_at')
            ->limit(120)
            ->get();

        return response()->json(['success' => true, 'messages' => $messages]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'min:1', 'max:500'],
        ]);

        $user = $request->user();
        $msg = ChatMessage::create([
            'id' => 'chat_' . Str::ulid(),
            'user_id' => $user->id,
            'username' => $user->username,
            'full_name' => $user->full_name,
            'role' => $user->role,
            'message' => trim($validated['message']),
        ]);

        return response()->json(['success' => true, 'message' => $msg], 201);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $msg = ChatMessage::findOrFail($id);
        $user = $request->user();
        if ($msg->user_id !== $user->id && ! in_array($user->role, ['admin', 'moderator'], true)) {
            abort(403, 'Not authorized to remove this message.');
        }
        $msg->delete();
        return response()->json(['success' => true]);
    }
}
