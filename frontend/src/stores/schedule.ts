import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/** ミーティング1件分のデータ型 */
export interface Meeting {
  summary: string
  start: string
  end: string
  timezone: string
}

/** APIレスポンス全体のデータ型 */
export interface ScheduleData {
  working_hours: {
    start: string
    end: string
  }
  /** 日付(yyyy-mm-dd)をキー、ミーティング配列を値とするオブジェクト */
  meetings: Record<string, Meeting[]>
}

/**
 * 時刻文字列(h:mm)から時の部分を数値で取得する
 * 例: '10:00' → 10, '14:30' → 14
 */
function parseHour(time: string): number {
  const [hour] = time.split(':')
  return parseInt(hour ?? '0')
}

/**
 * 時刻文字列(h:mm)を時・分の数値タプルに分解する
 * 例: '10:30' → [10, 30]
 */
export function parseTime(time: string): [number, number] {
  const parts = time.split(':')
  return [parseInt(parts[0] ?? '0'), parseInt(parts[1] ?? '0')]
}

/**
 * スケジュール管理ストア
 *
 * バックエンドAPIからスケジュールデータを取得し、
 * カレンダー表示に必要な日付一覧・時間スロット一覧を算出する
 */
export const useScheduleStore = defineStore('schedule', () => {
  /** APIから取得したスケジュールデータ（未取得時はnull） */
  const scheduleData = ref<ScheduleData | null>(null)

  /** API取得失敗時のエラーメッセージ */
  const error = ref<string | null>(null)

  /**
   * ミーティングが存在する日付の一覧（昇順ソート済み）
   * 例: ['2021-03-22', '2021-03-23', '2021-03-24']
   */
  const dates = computed(() => {
    if (!scheduleData.value) return []
    return Object.keys(scheduleData.value.meetings).sort()
  })

  /**
   * 勤務時間内の1時間刻みの時間スロット一覧
   * working_hours の start〜end から生成する
   * 例: ['10:00', '11:00', ..., '19:00']
   */
  const timeSlots = computed(() => {
    if (!scheduleData.value) return []
    const startHour = parseHour(scheduleData.value.working_hours.start)
    const endHour = parseHour(scheduleData.value.working_hours.end)
    const slots: string[] = []
    for (let h = startHour; h <= endHour; h++) {
      slots.push(`${h}:00`)
    }
    return slots
  })

  /**
   * バックエンドAPIからスケジュールデータを取得する
   * 成功時: scheduleData にデータを格納
   * 失敗時: error にエラーメッセージを格納
   */
  async function fetchSchedule() {
    try {
      const response = await fetch('/api/schedules')
      if (!response.ok) {
        error.value = 'スケジュールの取得に失敗しました'
        return
      }
      scheduleData.value = await response.json()
    } catch (e) {
      error.value = 'スケジュールの取得に失敗しました'
    }
  }

  return { scheduleData, error, dates, timeSlots, fetchSchedule }
})
