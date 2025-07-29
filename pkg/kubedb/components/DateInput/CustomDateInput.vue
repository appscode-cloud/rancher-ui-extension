<template>
  <div class="date-input-wrapper">
    <label v-if="label" class="control-label">
      {{ label }}
      <span v-if="required" class="required">*</span>
    </label>

    <div class="date-input-container" @click="toggleCalendar">
      <input
        type="text"
        class="form-control"
        :value="formattedDate"
        :placeholder="placeholder"
        readonly
        :disabled="disabled"
      />
      <i class="icon icon-calendar" />
    </div>

    <div v-if="showCalendar" class="calendar-dropdown">
      <div class="calendar-header">
        <div class="month-year">
          {{ monthNames[currentMonth] }} {{ currentYear }}
        </div>
        <div class="nav-buttons">
          <button type="button" class="nav-btn" @click="previousMonth">
            <i class="icon icon-chevron-up" />
          </button>
          <button type="button" class="nav-btn" @click="nextMonth">
            <i class="icon icon-chevron-down" />
          </button>
        </div>
      </div>

      <div class="calendar-weekdays">
        <div
          v-for="day in weekDays"
          :key="day"
          class="weekday"
        >
          {{ day }}
        </div>
      </div>

      <div class="calendar-grid">
        <button
          v-for="date in calendarDates"
          :key="`${date.month}-${date.day}`"
          type="button"
          class="calendar-day"
          :class="{
            'other-month': !date.isCurrentMonth,
            'selected': isSelected(date),
            'today': isToday(date)
          }"
          @click="selectDate(date)"
        >
          {{ date.day }}
        </button>
      </div>

      <div class="calendar-footer">
        <button type="button" class="btn btn-clear" @click="clearDate">
          Clear
        </button>
        <button type="button" class="btn btn-today" @click="selectToday">
          Today
        </button>
      </div>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

interface Props {
  modelValue?: Date | string | null;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  rules?: Array<(value: any) => string | boolean>;
}

interface CalendarDate {
  day: number;
  month: number;
  year: number;
  date: Date;
  isCurrentMonth: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select date',
  required: false,
  disabled: false,
  rules: () => []
});

const emit = defineEmits<{
  'update:modelValue': [value: Date | null];
}>();

const showCalendar = ref(false);
const currentMonth = ref(new Date().getMonth());
const currentYear = ref(new Date().getFullYear());
const pitrDateModel = ref<Date | null>(null);

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];


const formattedDate = computed(() => {
  if (!pitrDateModel.value) return '';
  
  const date = pitrDateModel.value;
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${month}/${day}/${year}`;
});

const calendarDates = computed((): CalendarDate[] => {
  const dates: CalendarDate[] = [];
  
  const firstDay = new Date(currentYear.value, currentMonth.value, 1);
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0);
  
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  

  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    
    dates.push({
      day: date.getDate(),
      month: date.getMonth(),
      year: date.getFullYear(),
      date: new Date(date),
      isCurrentMonth: date.getMonth() === currentMonth.value
    });
  }
  
  return dates;
});

const error = computed(() => {
  if (!props.rules || props.rules.length === 0) return '';
  
  for (const rule of props.rules) {
    const result = rule(pitrDateModel.value);
    if (typeof result === 'string') {
      return result;
    }
  }
  
  return '';
});


const toggleCalendar = () => {
  if (!props.disabled) {
    showCalendar.value = !showCalendar.value;
  }
};

const previousMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
};

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
};

const selectDate = (calendarDate: CalendarDate) => {
  pitrDateModel.value = new Date(calendarDate.date);
  emit('update:modelValue', pitrDateModel.value);
  showCalendar.value = false;
};

const clearDate = () => {
  pitrDateModel.value = null;
  emit('update:modelValue', null);
  showCalendar.value = false;
};

const selectToday = () => {
  pitrDateModel.value = new Date();
  emit('update:modelValue', pitrDateModel.value);
  showCalendar.value = false;
};

const isSelected = (calendarDate: CalendarDate): boolean => {
  if (!pitrDateModel.value) return false;
  
  return (
    pitrDateModel.value.getDate() === calendarDate.day &&
    pitrDateModel.value.getMonth() === calendarDate.month &&
    pitrDateModel.value.getFullYear() === calendarDate.year
  );
};

const isToday = (calendarDate: CalendarDate): boolean => {
  const today = new Date();
  return (
    today.getDate() === calendarDate.day &&
    today.getMonth() === calendarDate.month &&
    today.getFullYear() === calendarDate.year
  );
};

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Element;
  if (!target.closest('.date-input-wrapper')) {
    showCalendar.value = false;
  }
};

// Watchers
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    pitrDateModel.value = new Date(newValue);
    currentMonth.value = pitrDateModel.value.getMonth();
    currentYear.value = pitrDateModel.value.getFullYear();
  } else {
    pitrDateModel.value = null;
  }
}, { immediate: true });

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.date-input-wrapper {
  position: relative;
  margin-bottom: 20px;
  max-height: 300px;
}

.control-label {
  display: block;
  font-weight: 500;
  margin-bottom: 5px;
  color: #333;
}

.required {
  color: #d32f2f;
}

.date-input-container {
  position: relative;
  cursor: pointer;
}

.form-control {
  width: 100%;
  padding: 8px 35px 8px 12px;
  
  border-radius: 4px;

  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.form-control:hover {
  border-color: #bbb;
}

.form-control:focus {
  outline: none;
  border-color: #007cba;
  box-shadow: 0 0 0 2px rgba(0, 124, 186, 0.2);
}

.form-control:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.icon-calendar {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

.icon-calendar::before {
  content: "📅";
  font-size: 16px;
}

.calendar-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #2d2d2d;
  border: 1px solid #555;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  margin-top: 2px;
  max-width:400px;
  height: auto;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #555;
  background-color: #2d2d2d;
}

.month-year {
  font-weight: 600;
  font-size: 16px;
  color: #fff;
}

.nav-buttons {
  display: flex;
  gap: 4px;
}

.nav-btn {
  background: #444;
  border: 1px solid #666;
  padding: 6px 10px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
  color: #fff;
  font-size: 14px;
  font-weight: bold;
}

.nav-btn:hover {
  background-color: #555;
}

.icon-chevron-up::before {
  content: "↑";
}

.icon-chevron-down::before {
  content: "↓";
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: #2d2d2d;
  padding: 8px;
}

.weekday {
  text-align: center;
  font-weight: 600;
  font-size: 12px;
  color: #ccc;
  padding: 8px 4px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  padding: 8px;
  background-color: #2d2d2d;
}

.calendar-day {
  background: #2d2d2d;
  border: none;
  padding: 8px 4px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.2s ease;
  height: 32px; /* ✅ FIXED: match weekday height */
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.calendar-day:hover {
  background-color: #444;
}

.calendar-day.other-month {
  color: #666;
}

.calendar-day.selected {
  background-color: #007cba !important;
  color: white;
}

.calendar-day.today {
  background-color: #4a4a4a;
  color: #fff;
  font-weight: 600;
  border: 2px solid #007cba;
}

.calendar-footer {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  border-top: 1px solid #555;
  background-color: #2d2d2d;
}

.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.btn-clear {
  background-color: #6c757d;
  color: white;
}

.btn-clear:hover {
  background-color: #5a6268;
}

.btn-today {
  background-color: #007cba;
  color: white;
}

.btn-today:hover {
  background-color: #0056b3;
}

.error-message {
  color: #d32f2f;
  font-size: 12px;
  margin-top: 4px;
}
</style>