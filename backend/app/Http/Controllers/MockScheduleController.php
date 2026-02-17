<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;

/**
 * モックスケジュールAPI
 *
 * ScheduleControllerの外部API呼び出し先として使用する。
 * ダミーデータをそのまま返す。
 */
class MockScheduleController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
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
        ]);
    }
}
