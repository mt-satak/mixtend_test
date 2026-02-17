/**
 * Vercel Serverless Function: スケジュールAPI
 *
 * Vercel環境でフロントエンドからの /api/schedules リクエストに応答する。
 * ダミーデータをそのまま返す。
 */
export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  res.status(200).json({
    working_hours: {
      start: '10:00',
      end: '19:00',
    },
    meetings: {
      '2021-03-22': [
        { summary: 'Meeting 1', start: '10:00', end: '11:00', timezone: 'Asia/Tokyo' },
      ],
      '2021-03-23': [
        { summary: 'Meeting 2', start: '14:00', end: '15:00', timezone: 'Asia/Tokyo' },
        { summary: 'Meeting 3', start: '16:00', end: '17:00', timezone: 'Asia/Tokyo' },
      ],
      '2021-03-24': [
        { summary: 'Meeting 4', start: '10:30', end: '11:30', timezone: 'Asia/Tokyo' },
      ],
    },
  });
}
