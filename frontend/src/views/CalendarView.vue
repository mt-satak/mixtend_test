<script setup lang="ts">
import { computed } from 'vue'
import { useScheduleStore, parseTime } from '@/stores/schedule'
import type { Meeting } from '@/stores/schedule'

const store = useScheduleStore()

/** 1時間あたりのグリッド行の高さ(px) */
const HOUR_HEIGHT = 80

/**
 * 日付文字列(yyyy-mm-dd)を「M/DD（曜日）」形式にフォーマットする
 * 例: '2021-03-22' → '3/22（月）'
 */
function formatDateHeader(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  const weekdays = ['日', '月', '火', '水', '木', '金', '土']
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekday = weekdays[date.getDay()]
  return `${month}/${day}（${weekday}）`
}

/**
 * 時刻文字列(h:mm)を勤務開始時刻からの分数に変換する
 * カレンダー上のY座標計算に使用
 * 例: working_hours.start='10:00' のとき '11:30' → 90(分)
 */
function minutesFromStart(time: string): number {
  if (!store.scheduleData) return 0
  const [startHour] = parseTime(store.scheduleData.working_hours.start)
  const [h, m] = parseTime(time)
  return (h - startHour) * 60 + m
}

/**
 * ミーティングブロックのスタイルを算出する
 * top: 開始時刻に基づくY座標（勤務開始からの経過分 × ピクセル比率）
 * height: 所要時間に基づくブロックの高さ
 */
function meetingStyle(meeting: Meeting): Record<string, string> {
  const top = minutesFromStart(meeting.start) * (HOUR_HEIGHT / 60)
  const duration = minutesFromStart(meeting.end) - minutesFromStart(meeting.start)
  const height = duration * (HOUR_HEIGHT / 60)
  return {
    top: `${top}px`,
    height: `${height}px`,
  }
}

/**
 * 時間グリッド全体の高さを算出する
 * (勤務終了時刻 - 勤務開始時刻) × 1時間あたりの高さ
 */
const gridHeight = computed(() => {
  if (!store.scheduleData) return '0px'
  const [startHour] = parseTime(store.scheduleData.working_hours.start)
  const [endHour] = parseTime(store.scheduleData.working_hours.end)
  return `${(endHour - startHour) * HOUR_HEIGHT}px`
})
</script>

<template>
  <div class="calendar">
    <!-- カレンダータイトル -->
    <h1 class="calendar-title">カレンダーUI</h1>

    <div class="calendar-grid" v-if="store.scheduleData">
      <!-- ヘッダー行: 左上の空セル + 各日付 -->
      <div class="calendar-header">
        <div class="time-column-header"></div>
        <div
          v-for="date in store.dates"
          :key="date"
          class="date-header"
        >
          {{ formatDateHeader(date) }}
        </div>
      </div>

      <!-- カレンダー本体: 時間軸 + 日付ごとのカラム -->
      <div class="calendar-body">
        <!-- 左カラム: 時間ラベル（10:00〜19:00） -->
        <div class="time-column">
          <div
            v-for="slot in store.timeSlots"
            :key="slot"
            class="time-slot"
            :style="{ height: HOUR_HEIGHT + 'px' }"
          >
            {{ slot }}
          </div>
        </div>

        <!-- 各日付カラム: グリッド線 + ミーティングブロック -->
        <div
          v-for="date in store.dates"
          :key="date"
          class="day-column"
          :style="{ height: gridHeight }"
        >
          <!-- 1時間ごとのグリッド線 -->
          <div
            v-for="slot in store.timeSlots"
            :key="slot"
            class="grid-line"
            :style="{ height: HOUR_HEIGHT + 'px' }"
          ></div>

          <!-- ミーティングブロック（絶対配置で時間に応じた位置に表示） -->
          <div
            v-for="(meeting, index) in store.scheduleData.meetings[date]"
            :key="index"
            class="meeting-block"
            data-testid="meeting-block"
            :style="meetingStyle(meeting)"
          >
            {{ meeting.summary }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calendar {
  padding: 24px;
  font-family: sans-serif;
  color: #333;
}

.calendar-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 16px;
}

/* --- ヘッダー（日付行） --- */
.calendar-header {
  display: flex;
  border: 1px solid #e0e0e0;
  border-bottom: none;
}

.time-column-header {
  width: 80px;
  min-width: 80px;
  border-right: 1px solid #e0e0e0;
}

.date-header {
  flex: 1;
  text-align: center;
  padding: 8px 0;
  font-size: 14px;
  border-right: 1px solid #e0e0e0;
}

.date-header:last-child {
  border-right: none;
}

/* --- カレンダー本体 --- */
.calendar-body {
  display: flex;
  border: 1px solid #e0e0e0;
}

/* 時間軸カラム */
.time-column {
  width: 80px;
  min-width: 80px;
  border-right: 1px solid #e0e0e0;
}

.time-slot {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 4px;
  font-size: 13px;
  color: #666;
  border-bottom: 1px solid #e0e0e0;
  box-sizing: border-box;
}

.time-slot:last-child {
  border-bottom: none;
}

/* 日付ごとのカラム */
.day-column {
  flex: 1;
  position: relative;
  border-right: 1px solid #e0e0e0;
}

.day-column:last-child {
  border-right: none;
}

/* 1時間ごとのグリッド線 */
.grid-line {
  border-bottom: 1px solid #e0e0e0;
  box-sizing: border-box;
}

.grid-line:last-child {
  border-bottom: none;
}

/* ミーティングブロック */
.meeting-block {
  position: absolute;
  left: 4px;
  right: 4px;
  background-color: #6fb9a8;
  color: white;
  font-size: 13px;
  padding: 4px 8px;
  border-radius: 2px;
  overflow: hidden;
  box-sizing: border-box;
}
</style>
