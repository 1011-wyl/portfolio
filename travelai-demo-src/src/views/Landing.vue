<template>
  <div class="landing">
    <p class="demo-notice">作品集演示 · 点击生成或下方示例行程，查看预设的厦门三日游。天气、价格和问答均为演示数据。</p>
    <div class="landing__stage">
      <TripHero class="landing__hero" />
      <div id="trip-planner" class="landing__planner">
        <TripPlannerForm
          v-if="!loading"
          :model-value="formData"
          :total-days="totalDays"
          :end-date="computedEndDate"
          :submitting="loading"
          @submit="handleSubmit"
          @update:cities="(value) => (formData.cities = value)"
          @update:start-date="(value) => (formData.start_date = value)"
          @update:transportation="(value) => (formData.transportation = value)"
          @update:accommodation="(value) => (formData.accommodation = value)"
          @update:preferences="(value) => (formData.preferences = value)"
          @update:free-text="(value) => (formData.free_text_input = value)"
        />
        <div v-else class="landing__live">
          <TripBrief v-if="submittedBrief" :snapshot="submittedBrief" />
          <PlanningJourney
            :stage="taskStage"
            :progress="loadingProgress"
            :status-message="loadingStatus"
            :plan-code="planCode"
            :elapsed-ms="elapsedMs"
            :completed="taskCompleted"
          />
        </div>
        <ErrorJourneyState
          v-if="generateError"
          class="landing__generate-error"
          :title="t('home.generateError.title')"
          :what-happened="generateError"
          :data-status="t('home.generateError.dataKept')"
        >
          <template #action>
            <div class="landing__error-actions">
              <AppButton variant="secondary" :disabled="loading" @click="focusPlanner">
                {{ t('home.generateError.edit') }}
              </AppButton>
              <AppButton variant="primary" :loading="loading" :disabled="loading" @click="handleSubmit">
                {{ t('home.generateError.retry') }}
              </AppButton>
            </div>
          </template>
        </ErrorJourneyState>
      </div>
    </div>

    <TripHistory
      class="landing__history"
      :items="historyPlans"
      :status="historyStatus"
      :error-message="historyError"
      @open="openHistoryPlan"
      @retry="loadHistoryPlans"
      @focus-planner="focusPlanner"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { message } from 'ant-design-vue'
import { openDemo, demoPlan } from '@/demo'
import type { TripHistoryItem, TripTaskStage } from '@/types'
import TripHero from '@/components/landing/TripHero.vue'
import TripPlannerForm from '@/components/landing/TripPlannerForm.vue'
import PlanningJourney from '@/components/landing/PlanningJourney.vue'
import TripHistory from '@/components/landing/TripHistory.vue'
import type { HistoryStatus } from '@/components/landing/TripHistory.vue'
import TripBrief from '@/components/trip/TripBrief.vue'
import ErrorJourneyState from '@/components/feedback/ErrorJourneyState.vue'
import AppButton from '@/components/ui/AppButton.vue'
import {
  createDefaultLandingForm,
  type TripBriefSnapshot,
} from '@/components/landing/landingModel'

const router = useRouter()
const { t } = useI18n()

const loading = ref(false)
const loadingProgress = ref(0)
const loadingStatus = ref('')
const planCode = ref('')
const taskStage = ref<TripTaskStage | ''>('')
const taskCompleted = ref(false)
const generateError = ref('')
const elapsedMs = ref(0)
const submittedBrief = ref<TripBriefSnapshot | null>(null)
const historyLoading = ref(false)
const historyPlans = ref<TripHistoryItem[]>([])
const historyError = ref('')
const formData = reactive(createDefaultLandingForm())

let elapsedTimer: number | null = null

const totalDays = computed(() => formData.cities.reduce((sum, item) => sum + (item.days || 1), 0))
const computedEndDate = computed(() => {
  if (!formData.start_date) return null
  return formData.start_date.add(totalDays.value - 1, 'day')
})
const historyStatus = computed<HistoryStatus>(() => {
  if (historyLoading.value) return 'loading'
  if (historyError.value) return 'error'
  if (historyPlans.value.length === 0) return 'empty'
  return 'success'
})

const stopElapsed = () => {
  if (elapsedTimer) {
    window.clearInterval(elapsedTimer)
    elapsedTimer = null
  }
}

const openHistoryPlan = (_planId: string) => {
  openDemo()
  router.push('/result')
}
const loadHistoryPlans = async () => {
  historyPlans.value = [{ plan_id: 'demo', task_id: 'demo', city: '厦门 · 示例行程', start_date: demoPlan.start_date, end_date: demoPlan.end_date, travel_days: 3, updated_at: new Date().toISOString(), overall_suggestions: demoPlan.overall_suggestions }]
}

const focusPlanner = () => {
  const planner = document.getElementById('trip-planner')
  planner?.scrollIntoView({ block: 'start' })
  planner?.querySelector<HTMLElement>('input, textarea, button')?.focus()
}

const handleSubmit = async () => {
  openDemo()
  message.info('演示模式：展示预设的厦门三日行程')
  router.push('/result')
}

onMounted(() => {
  void loadHistoryPlans()
})

onUnmounted(() => {
  stopElapsed()
})
</script>

<style scoped>
.demo-notice { margin: 0; color: var(--text-secondary); font-size: 14px; }
.landing {
  width: min(100%, var(--content-max));
  margin: 0 auto;
  padding: var(--space-8) var(--page-gutter) var(--space-16);
  display: grid;
  gap: var(--space-16);
  overflow-x: hidden;
}

.landing__stage {
  display: grid;
  gap: var(--space-8);
}

.landing__planner {
  scroll-margin-top: calc(var(--header-h) + 12px);
  min-width: 0;
}

.landing__live {
  display: grid;
  gap: var(--space-4);
}

.landing__generate-error {
  margin-top: var(--space-4);
}

.landing__error-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-2);
}

@media (min-width: 1024px) {
  .landing__stage {
    grid-template-columns: 5fr 7fr;
    align-items: start;
    gap: var(--space-12);
  }
}
</style>
