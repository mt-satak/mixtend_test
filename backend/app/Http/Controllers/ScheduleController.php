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
            // TODO: 外部APIが利用可能になったら元のHTTPリクエスト処理に戻す
            $data = [
                'working_hours' => [
                    'start' => '10:00',
                    'end' => '19:00',
                ],
                'meetings' => [
                    '2021-03-22' => [
                        ['summary' => 'Meeting 1', 'start' => '10:00', 'end' => '11:00', 'timezone' => 'Asia/Tokyo'],
                    ],
                    '2021-03-23' => [
                        ['summary' => 'Meeting 2', 'start' => '14:00', 'end' => '15:00', 'timezone' => 'Asia/Tokyo'],
                        ['summary' => 'Meeting 3', 'start' => '16:00', 'end' => '17:00', 'timezone' => 'Asia/Tokyo'],
                    ],
                    '2021-03-24' => [
                        ['summary' => 'Meeting 4', 'start' => '10:30', 'end' => '11:30', 'timezone' => 'Asia/Tokyo'],
                    ],
                ],
            ];

            Log::channel('api')->info('Schedule API response', ['data' => $data]);

            return response()->json($data);
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            return response()->json(['error' => '外部APIへの接続に失敗しました'], 500);
        } catch (\Throwable $e) {
            return response()->json(['error' => '予期しないエラーが発生しました'], 500);
        }
    }
}
