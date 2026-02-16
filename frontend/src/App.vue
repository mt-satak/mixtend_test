<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useScheduleStore } from '@/stores/schedule'

/**
 * アプリ起動時にバックエンドAPIからスケジュールデータを取得する
 */
const store = useScheduleStore()
onMounted(() => {
  store.fetchSchedule()
})
</script>

<template>
  <RouterView />
</template>
