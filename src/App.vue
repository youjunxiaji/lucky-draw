<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
    <div class="max-w-6xl w-full backdrop-blur-xl bg-white/10 rounded-3xl p-8 shadow-2xl">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-4xl font-bold text-white">幸运抽奖</h1>
        
        <!-- 当前奖项显示 -->
        <div class="space-x-4 flex items-center">
          <div class="text-white text-xl">
            当前抽取：
            <span :class="{
              'text-yellow-400': currentPrizeLevel === 1,
              'text-blue-400': currentPrizeLevel === 2
            }">
              {{ prizes.find(p => p.level === currentPrizeLevel)?.name }}
            </span>
          </div>
          
          <!-- 重置按钮 -->
          <button
            @click="resetDraw"
            class="px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all"
            :disabled="isDrawing"
          >
            重置抽奖
          </button>
        </div>
      </div>
      
      <div class="space-y-8">
        <!-- 同事展示区 -->
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          <div
            v-for="person in colleaguesData"
            :key="person.id"
            :class="[
              'relative group rounded-xl p-4 transition-all overflow-hidden',
              person.prize ? 'bg-gradient-to-b from-white/20 to-white/10' : 'bg-white/20',
              person.id === currentPerson?.id ? 'ring-2 ring-white scale-105' : 'hover:scale-105'
            ]"
          >
            <!-- 奖项标识 -->
            <div
              v-if="person.prize"
              class="absolute -right-12 top-4 w-40 text-center transform rotate-45 text-white text-sm font-bold py-1"
              :class="{
                'bg-gradient-to-r from-yellow-500 to-amber-500': person.prize === 1,
                'bg-gradient-to-r from-blue-500 to-cyan-500': person.prize === 2
              }"
            >
              {{ prizes.find(p => p.level === person.prize)?.name }}
            </div>
            
            <div class="relative">
              <div 
                v-if="person.prize"
                class="absolute -inset-1 rounded-full blur-md"
                :class="{
                  'bg-yellow-500/30': person.prize === 1,
                  'bg-blue-500/30': person.prize === 2
                }"
              ></div>
              <img 
                :src="person.avatar" 
                :alt="person.name" 
                :class="[
                  'relative w-24 h-24 mx-auto rounded-full mb-3 transition-all',
                  person.prize ? 'ring-[3px] ring-offset-2 ring-offset-gray-800' : '',
                  person.prize === 1 ? 'ring-yellow-500' : '',
                  person.prize === 2 ? 'ring-blue-500' : ''
                ]"
              />
            </div>
            
            <div class="text-center relative">
              <h3 class="text-xl font-bold text-white mb-1">
                {{ person.name }}
                <span v-if="person.prize" class="inline-block animate-bounce ml-1">🎉</span>
              </h3>
              <p class="text-gray-300 text-sm mb-1">{{ person.department }}</p>
              <p class="text-gray-400 text-xs">{{ person.title }}</p>
              <p 
                v-if="person.prize" 
                class="text-sm mt-2 font-medium"
                :class="{
                  'text-yellow-400': person.prize === 1,
                  'text-blue-400': person.prize === 2
                }"
              >
                恭喜获得{{ prizes.find(p => p.level === person.prize)?.name }}！
              </p>
            </div>
          </div>
        </div>
        
        <!-- 抽奖区域 -->
        <div class="text-center space-y-6 mt-12">
          <div class="relative">
            <transition name="bounce">
              <div v-if="currentPerson" key="result" class="space-y-4">
                <div class="relative inline-block">
                  <div class="absolute inset-0 bg-white/20 rounded-full blur-xl transform scale-110"></div>
                  <img 
                    :src="currentPerson.avatar" 
                    :alt="currentPerson.name"
                    class="relative w-48 h-48 rounded-full mx-auto shadow-xl border-4 border-white/30"
                  />
                </div>
                <div class="relative">
                  <h2 class="text-4xl font-bold text-white mb-2">
                    {{ currentPerson.name }}
                    <span v-if="!isDrawing" class="inline-block animate-bounce">🎉</span>
                  </h2>
                  <p class="text-xl text-gray-300">{{ currentPerson.department }} - {{ currentPerson.title }}</p>
                  <p v-if="!isDrawing" class="text-2xl mt-2" :class="{
                    'text-yellow-400': currentPrizeLevel === 1,
                    'text-blue-400': currentPrizeLevel === 2
                  }">
                    恭喜获得{{ prizes.find(p => p.level === currentPrizeLevel)?.name }}！
                  </p>
                </div>
              </div>
              <div v-else key="placeholder" class="text-6xl font-bold text-white opacity-50">
                点击开始
              </div>
            </transition>
          </div>
          
          <button
            @click="toggleDraw"
            :disabled="!canDraw"
            class="px-12 py-4 bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:cursor-not-allowed text-white text-xl rounded-2xl transition-all transform hover:scale-105 active:scale-95"
          >
            {{ buttonText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useIntervalFn } from '@vueuse/core'
import gsap from 'gsap'
import confetti from 'canvas-confetti'
import { colleagues, prizes } from './config/prizes'

const currentPerson = ref(null)
const isDrawing = ref(false)

// 深拷贝同事数据，用于状态管理
const colleaguesData = ref(JSON.parse(JSON.stringify(colleagues)))
const prizesData = ref(JSON.parse(JSON.stringify(prizes)))

// 自动计算当前应该抽取的奖项等级
const currentPrizeLevel = computed(() => {
  // 按照奖项等级从小到大遍历（1是最高等级）
  for (const prize of prizesData.value) {
    const awardedCount = colleaguesData.value.filter(p => p.prize === prize.level).length
    if (awardedCount < prize.count) {
      return prize.level
    }
  }
  return null // 所有奖项都抽完了
})

// 计算是否可以抽奖
const canDraw = computed(() => {
  if (isDrawing.value) return true
  const availableColleagues = colleaguesData.value.filter(p => !p.prize)
  return availableColleagues.length > 0 && currentPrizeLevel.value !== null
})

// 计算按钮文字
const buttonText = computed(() => {
  if (!canDraw.value && !isDrawing.value) return '抽奖已完成'
  return isDrawing.value ? '停止抽取' : '开始抽取'
})

const { pause, resume } = useIntervalFn(() => {
  // 只从未中奖的同事中抽取
  const availableColleagues = colleaguesData.value.filter(p => !p.prize)
  const randomIndex = Math.floor(Math.random() * availableColleagues.length)
  currentPerson.value = availableColleagues[randomIndex]
}, 50, { immediate: false })

// 创建礼花特效
const createCelebration = () => {
  // 左侧礼花
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { x: 0.2, y: 0.8 }
  })
  
  // 右侧礼花
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { x: 0.8, y: 0.8 }
  })
  
  // 中间礼花雨
  setTimeout(() => {
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { x: 0.5, y: 0.3 },
      gravity: 0.5,
      scalar: 1.2,
      drift: 0
    })
  }, 250)
}

// 重置抽奖
const resetDraw = () => {
  colleaguesData.value = JSON.parse(JSON.stringify(colleagues))
  prizesData.value = JSON.parse(JSON.stringify(prizes))
  currentPerson.value = null
  isDrawing.value = false
}

const toggleDraw = () => {
  if (!isDrawing.value) {
    // 开始抽取
    isDrawing.value = true
    resume()
  } else {
    // 停止抽取
    isDrawing.value = false
    pause()
    
    // 标记中奖
    const winner = colleaguesData.value.find(p => p.id === currentPerson.value.id)
    if (winner) {
      winner.prize = currentPrizeLevel.value
    }
    
    // 添加弹跳动画
    gsap.from('.bounce-enter-active', {
      scale: 1.2,
      duration: 0.5,
      ease: 'bounce.out'
    })
    
    // 触发庆祝特效
    createCelebration()
  }
}
</script>

<style>
.bounce-enter-active {
  transition: all 0.5s ease-out;
}
.bounce-enter-from,
.bounce-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
