<script setup>
import { ref } from 'vue'
import { format, parseISO, getTime } from 'date-fns'

// 狀態變數
const timestampInput = ref(Math.floor(Date.now() / 1000))
const dateResult = ref('')
const dateInput = ref(format(new Date(), "yyyy-MM-dd'T'HH:mm"))
const timestampResult = ref('')

// 轉換功能：Timestamp -> Date
const convertToDate = () => {
  try {
    // 判斷是秒還是毫秒 (如果長度大於10位通常是毫秒，這裡簡單處理)
    let ts = timestampInput.value
    if (String(ts).length === 10) ts *= 1000
    
    dateResult.value = format(new Date(ts), 'yyyy-MM-dd HH:mm:ss')
  } catch (e) {
    dateResult.value = '無效的時間戳'
  }
}

// 轉換功能：Date -> Timestamp
const convertToTimestamp = () => {
  try {
    const date = parseISO(dateInput.value)
    timestampResult.value = Math.floor(getTime(date) / 1000)
  } catch (e) {
    timestampResult.value = '無效的日期'
  }
}

// 初始化執行一次
convertToDate()
convertToTimestamp()
</script>

<template>
  <div class="container">
    <h1>⏳ 時間戳轉換器</h1>

    <div class="card">
      <h2>Unix Timestamp 轉 日期</h2>
      <input type="number" v-model="timestampInput" placeholder="輸入 Timestamp (例如 1700000000)" />
      <button @click="convertToDate">轉換 ⬇</button>
      <div class="result">{{ dateResult }}</div>
    </div>

    <div class="card">
      <h2>日期 轉 Unix Timestamp</h2>
      <input type="datetime-local" v-model="dateInput" step="1" />
      <button @click="convertToTimestamp">轉換 ⬇</button>
      <div class="result">{{ timestampResult }}</div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 600px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
  padding: 2rem;
  text-align: center;
}
.card {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}
input {
  padding: 10px;
  font-size: 1rem;
  margin-right: 10px;
  width: 60%;
}
button {
  padding: 10px 20px;
  background-color: #42b883;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 4px;
}
button:hover { background-color: #33a06f; }
.result {
  margin-top: 15px;
  font-size: 1.5rem;
  font-weight: bold;
  color: #35495e;
}
</style>
