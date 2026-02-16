<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

class ScheduleApiTest extends TestCase
{
    private array $fakeApiResponse = [
        'working_hours' => [
            'start' => '10:00',
            'end' => '19:00',
        ],
        'meetings' => [
            '2021-03-22' => [
                [
                    'summary' => 'Meeting 1',
                    'start' => '10:00',
                    'end' => '11:00',
                    'timezone' => 'Asia/Tokyo',
                ],
            ],
            '2021-03-23' => [
                [
                    'summary' => 'Meeting 2',
                    'start' => '14:00',
                    'end' => '15:00',
                    'timezone' => 'Asia/Tokyo',
                ],
                [
                    'summary' => 'Meeting 3',
                    'start' => '16:00',
                    'end' => '17:00',
                    'timezone' => 'Asia/Tokyo',
                ],
            ],
            '2021-03-24' => [
                [
                    'summary' => 'Meeting 4',
                    'start' => '10:30',
                    'end' => '11:30',
                    'timezone' => 'Asia/Tokyo',
                ],
            ],
        ],
    ];

    public function test_スケジュールAPIが正しいJSON構造を返すこと(): void
    {
        Http::fake([
            '*' => Http::response($this->fakeApiResponse, 200),
        ]);

        $response = $this->getJson('/api/schedules');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'working_hours' => ['start', 'end'],
                'meetings' => [
                    '*' => [
                        '*' => ['summary', 'start', 'end', 'timezone'],
                    ],
                ],
            ]);
    }

    public function test_スケジュールAPIが正しいデータを返すこと(): void
    {
        Http::fake([
            '*' => Http::response($this->fakeApiResponse, 200),
        ]);

        $response = $this->getJson('/api/schedules');

        $response->assertStatus(200)
            ->assertJsonPath('working_hours.start', '10:00')
            ->assertJsonPath('working_hours.end', '19:00')
            ->assertJsonPath('meetings.2021-03-22.0.summary', 'Meeting 1');
    }

    public function test_外部APIリクエスト時にユーザーエージェントが正しく設定されること(): void
    {
        Http::fake(function ($request) {
            $this->assertEquals('Mixtend Coding Test', $request->header('User-Agent')[0]);

            return Http::response($this->fakeApiResponse, 200);
        });

        $this->getJson('/api/schedules');
    }

    public function test_外部APIレスポンスがログに記録されること(): void
    {
        Http::fake([
            '*' => Http::response($this->fakeApiResponse, 200),
        ]);

        Log::shouldReceive('channel')
            ->with('api')
            ->once()
            ->andReturnSelf();
        Log::shouldReceive('info')
            ->once();

        $this->getJson('/api/schedules');
    }

    public function test_CORSヘッダーが正しく設定されること(): void
    {
        Http::fake([
            '*' => Http::response($this->fakeApiResponse, 200),
        ]);

        $response = $this->getJson('/api/schedules', [
            'Origin' => 'http://localhost:5173',
        ]);

        $response->assertHeader('Access-Control-Allow-Origin');
    }

    public function test_外部APIがエラーを返した場合に500を返すこと(): void
    {
        Http::fake([
            '*' => Http::response('Server Error', 500),
        ]);

        $response = $this->getJson('/api/schedules');

        $response->assertStatus(500)
            ->assertJsonStructure(['error']);
    }

    public function test_外部APIへの接続がタイムアウトした場合に500を返すこと(): void
    {
        Http::fake(function () {
            throw new \Illuminate\Http\Client\ConnectionException('Connection timed out');
        });

        $response = $this->getJson('/api/schedules');

        $response->assertStatus(500)
            ->assertJsonStructure(['error']);
    }

    public function test_外部APIが不正なJSONを返した場合に500を返すこと(): void
    {
        Http::fake([
            '*' => Http::response('not valid json{{{', 200),
        ]);

        $response = $this->getJson('/api/schedules');

        $response->assertStatus(500)
            ->assertJsonStructure(['error']);
    }

    public function test_外部APIが想定外の構造を返した場合に500を返すこと(): void
    {
        Http::fake([
            '*' => Http::response(['unexpected' => 'data'], 200),
        ]);

        $response = $this->getJson('/api/schedules');

        $response->assertStatus(500)
            ->assertJsonStructure(['error']);
    }
}
