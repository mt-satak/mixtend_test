# Mixtend Coding Test

ミーティングスケジュールをカレンダーUIで表示するWebアプリケーション。

## 本番環境

https://mixtendtest.vercel.app

## 技術スタック

| レイヤー | 技術 | バージョン |
|---|---|---|
| バックエンド | PHP / Laravel | 8.5 / 12.x |
| フロントエンド | TypeScript / Vue.js | 5.9 / 3.5 |
| 状態管理 | Pinia | 3.0 |
| ビルドツール | Vite | 7.3 |
| テスト（バックエンド） | PHPUnit | 11.5 |
| テスト（フロントエンド） | Vitest | 4.0 |
| 本番デプロイ | Vercel | - |

## アーキテクチャ

### ローカル開発環境（Docker）

```
ブラウザ
  │
  ├─ GET / ──────────────→ Nginx ──→ Vue.js (frontend/dist)
  │
  └─ GET /api/schedules ─→ Nginx ──→ PHP-FPM ──→ Laravel (ScheduleController)
                                                      │
                                                      ├─→ 外部API (SCHEDULE_API_URL)
                                                      └─→ ログ記録 (storage/logs/api.log)
```

- 単一Dockerコンテナ内で **Nginx + PHP-FPM + Node.js** を Supervisor で管理
- Nginx がフロントエンド（静的ファイル）と API（PHP-FPM）の両方をポート80で配信
- `ScheduleController` は外部APIからスケジュールデータを取得し、User-Agent を `Mixtend Coding Test` に設定
- 開発時(デモ用ページ表示)は `MockScheduleController`（`/api/mock/schedules`）でダミーデータを返却

### 本番環境（Vercel）

```
ブラウザ
  │
  ├─ GET / ──────────────→ Vercel CDN ──→ Vue.js SPA (frontend/dist)
  │
  └─ GET /api/schedules ─→ Vercel Serverless Function (api/schedules.js)
                              └─→ ダミーJSONデータを返却
```

- フロントエンドは Vercel CDN から配信
- API は Node.js サーバーレス関数で実装（PHP ランタイムは Vercel の 250MB サイズ制限を超えるため）
- SPA ルーティング対応のリライトルールを設定

## ディレクトリ構成

```
.
├── backend/                    # Laravel 12 アプリケーション
│   ├── app/Http/Controllers/
│   │   ├── ScheduleController.php      # スケジュールAPI（外部API取得）
│   │   └── MockScheduleController.php  # モックAPI（ダミーデータ）
│   ├── config/
│   │   ├── services.php                # 外部API URL設定
│   │   └── logging.php                 # APIログチャネル設定
│   ├── routes/api.php                  # APIルート定義
│   └── tests/Feature/
│       └── ScheduleApiTest.php         # APIテスト（9件）
├── frontend/                   # Vue.js 3 アプリケーション
│   ├── src/
│   │   ├── stores/schedule.ts          # Piniaストア（API取得・データ管理）
│   │   ├── views/CalendarView.vue      # カレンダーUIコンポーネント
│   │   ├── router/index.ts             # ルーティング設定
│   │   └── __tests__/                  # フロントエンドテスト（11件）
│   ├── package.json
│   └── vite.config.ts
├── api/                        # Vercel サーバーレス関数
│   └── schedules.js
├── docker/                     # Docker設定
│   ├── nginx/default.conf
│   └── supervisord.conf
├── Dockerfile
├── docker-compose.yml
└── vercel.json                 # Vercelデプロイ設定
```

## ローカル開発環境の構築

### 前提条件

- Docker / Docker Compose

### セットアップ

```bash
# 1. リポジトリをクローン
git clone https://github.com/mt-satak/mixtend_test.git
cd mixtend_test

# 2. Dockerイメージをビルド
docker compose build

# 3. Laravelの初期設定
docker compose run --rm app bash -c "cd /var/www/backend && cp .env.example .env && php artisan key:generate"

# 4. フロントエンドをビルド
docker compose run --rm app bash -c "cd /var/www/frontend && npm install && npm run build-only"

# 5. コンテナを起動
docker compose up -d
```

http://localhost:8080 でアプリケーションにアクセスできます。

### テストの実行

```bash
# バックエンドテスト（PHPUnit）
docker compose run --rm app bash -c "cd /var/www/backend && php artisan test --filter=ScheduleApiTest"

# フロントエンドテスト（Vitest）
docker compose run --rm app bash -c "cd /var/www/frontend && npx vitest run"
```

### コンテナの停止

```bash
docker compose down
```

## Vercelへのデプロイ

### 前提条件

- Vercel アカウント（[vercel.com/signup](https://vercel.com/signup) から GitHub 連携で登録）
- Node.js（npx が使える環境）

### デプロイ手順

```bash
# 1. Vercel CLIにログイン
npx vercel login

# 2. 本番デプロイ
npx vercel --prod
```

デプロイが完了すると、本番URLが表示されます。
