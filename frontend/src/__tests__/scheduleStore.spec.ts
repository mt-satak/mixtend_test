import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useScheduleStore } from '@/stores/schedule'

const mockScheduleData = {
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
}

describe('Schedule Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('初期状態ではscheduleDataがnullであること', () => {
    const store = useScheduleStore()
    expect(store.scheduleData).toBeNull()
  })

  it('fetchScheduleでAPIからデータを取得できること', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockScheduleData),
    })

    const store = useScheduleStore()
    await store.fetchSchedule()

    expect(store.scheduleData).toEqual(mockScheduleData)
  })

  it('日付一覧をソート済みで取得できること', async () => {
    const store = useScheduleStore()
    store.scheduleData = mockScheduleData

    expect(store.dates).toEqual(['2021-03-22', '2021-03-23', '2021-03-24'])
  })

  it('時間スロット一覧を取得できること', async () => {
    const store = useScheduleStore()
    store.scheduleData = mockScheduleData

    const hours = store.timeSlots
    expect(hours[0]).toBe('10:00')
    expect(hours[hours.length - 1]).toBe('19:00')
    expect(hours.length).toBe(10)
  })

  it('API取得失敗時にerrorが設定されること', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    })

    const store = useScheduleStore()
    await store.fetchSchedule()

    expect(store.error).toBeTruthy()
    expect(store.scheduleData).toBeNull()
  })
})
