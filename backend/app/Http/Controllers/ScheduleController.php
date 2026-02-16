<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ScheduleController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            $response = Http::withHeaders([
                'User-Agent' => 'Mixtend Coding Test',
            ])->get(config('services.schedule_api.url'));

            if ($response->failed()) {
                return response()->json(['error' => '外部APIからエラーレスポンスを受信しました'], 500);
            }

            $data = $response->json();

            if (! is_array($data) || ! isset($data['working_hours'], $data['meetings'])) {
                return response()->json(['error' => '外部APIから想定外のレスポンスを受信しました'], 500);
            }

            Log::channel('api')->info('Schedule API response', ['data' => $data]);

            return response()->json($data);
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            return response()->json(['error' => '外部APIへの接続に失敗しました'], 500);
        } catch (\Throwable $e) {
            return response()->json(['error' => '予期しないエラーが発生しました'], 500);
        }
    }
}
