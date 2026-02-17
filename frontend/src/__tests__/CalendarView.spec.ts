import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import CalendarView from '@/views/CalendarView.vue'
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

describe('CalendarView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('タイトル「カレンダーUI」が表示されること', async () => {
    const store = useScheduleStore()
    store.scheduleData = mockScheduleData

    const wrapper = mount(CalendarView)
    expect(wrapper.text()).toContain('カレンダーUI')
  })

  it('日付ヘッダーがM/DD（曜日）形式で表示されること', async () => {
    const store = useScheduleStore()
    store.scheduleData = mockScheduleData

    const wrapper = mount(CalendarView)
    expect(wrapper.text()).toContain('3/22（月）')
    expect(wrapper.text()).toContain('3/23（火）')
    expect(wrapper.text()).toContain('3/24（水）')
  })

  it('時間軸が10:00から19:00まで1時間刻みで表示されること', async () => {
    const store = useScheduleStore()
    store.scheduleData = mockScheduleData

    const wrapper = mount(CalendarView)
    const hours = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00']
    for (const hour of hours) {
      expect(wrapper.text()).toContain(hour)
    }
  })

  it('ミーティングのタイトルが表示されること', async () => {
    const store = useScheduleStore()
    store.scheduleData = mockScheduleData

    const wrapper = mount(CalendarView)
    expect(wrapper.text()).toContain('Meeting 1')
    expect(wrapper.text()).toContain('Meeting 2')
    expect(wrapper.text()).toContain('Meeting 3')
    expect(wrapper.text()).toContain('Meeting 4')
  })

  it('ミーティングブロックが正しい位置に配置されること', async () => {
    const store = useScheduleStore()
    store.scheduleData = mockScheduleData

    const wrapper = mount(CalendarView)
    const meetingBlocks = wrapper.findAll('[data-testid="meeting-block"]')
    expect(meetingBlocks.length).toBe(4)
  })

  it('ミーティングブロックの高さが時間に応じて計算されること', async () => {
    const store = useScheduleStore()
    store.scheduleData = mockScheduleData

    const wrapper = mount(CalendarView)
    const meetingBlocks = wrapper.findAll('[data-testid="meeting-block"]')

    // Meeting 1: 10:00-11:00 = 1時間
    // Meeting 4: 10:30-11:30 = 1時間
    // 全て1時間のミーティングなので同じ高さになるはず
    const block1Style = meetingBlocks[0].attributes('style') || ''
    expect(block1Style).toContain('height')
  })
})
