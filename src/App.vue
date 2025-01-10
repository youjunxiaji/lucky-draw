<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
    <div class="max-w-5xl w-full backdrop-blur-xl bg-white/10 rounded-3xl p-6 shadow-2xl">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-white">幸运抽奖</h1>
        
        <!-- 当前奖项显示 -->
        <div class="space-x-4 flex items-center">
          <div class="text-white text-lg">
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
            class="px-4 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all text-sm"
            :disabled="isDrawing"
          >
            重置抽奖
          </button>
        </div>
      </div>
      
      <div class="space-y-6">
        <!-- 同事展示区 -->
        <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          <div
            v-for="person in colleaguesData"
            :key="person.id"
            :class="[
              'relative group rounded-xl p-3 transition-all overflow-hidden',
              person.prize ? 'bg-gradient-to-b from-white/20 to-white/10' : 'bg-white/20',
              person.id === currentPerson?.id && !person.prize ? 'ring-2 ring-white scale-105' : 'hover:scale-105'
            ]"
          >
            <!-- 奖项标识 -->
            <div
              v-if="person.prize"
              class="absolute -right-10 top-3 w-32 text-center transform rotate-45 text-white text-xs font-bold py-0.5"
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
                  'relative w-16 h-16 mx-auto rounded-full mb-2 transition-all',
                  person.prize ? 'ring-2 ring-offset-2 ring-offset-gray-800' : '',
                  person.prize === 1 ? 'ring-yellow-500' : '',
                  person.prize === 2 ? 'ring-blue-500' : ''
                ]"
              />
            </div>
            
            <div class="text-center relative">
              <h3 class="text-base font-bold text-white mb-0.5 truncate">
                {{ person.name }}
                <span v-if="person.prize" class="inline-block animate-bounce ml-0.5">🎉</span>
              </h3>
              <p class="text-gray-300 text-xs mb-0.5 truncate">{{ person.department }}</p>
              <p class="text-gray-400 text-xs truncate">{{ person.title }}</p>
              <p 
                v-if="person.prize" 
                class="text-xs mt-1 font-medium truncate"
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
        <div class="text-center space-y-4 mt-6">
          <div class="relative">
            <transition name="bounce">
              <div v-if="currentPerson" key="result" class="space-y-3">
                <div class="relative inline-block">
                  <div class="absolute inset-0 bg-white/20 rounded-full blur-xl transform scale-110"></div>
                  <img 
                    :src="currentPerson.avatar" 
                    :alt="currentPerson.name"
                    class="relative w-32 h-32 rounded-full mx-auto shadow-xl border-4 border-white/30"
                  />
                </div>
                <div class="relative">
                  <h2 class="text-3xl font-bold text-white mb-1">
                    {{ currentPerson.name }}
                    <span v-if="!isDrawing && !currentPerson.prize" class="inline-block animate-bounce">🎉</span>
                  </h2>
                  <p class="text-lg text-gray-300">{{ currentPerson.department }} - {{ currentPerson.title }}</p>
                  <template v-if="!isDrawing">
                    <p v-if="currentPerson.prize" class="text-xl mt-2" :class="{
                      'text-yellow-400': currentPerson.prize === 1,
                      'text-blue-400': currentPerson.prize === 2
                    }">
                      已获得{{ prizes.find(p => p.level === currentPerson.prize)?.name }}
                    </p>
                    <p v-else class="text-xl mt-2" :class="{
                      'text-yellow-400': currentPrizeLevel === 1,
                      'text-blue-400': currentPrizeLevel === 2
                    }">
                      恭喜获得{{ prizes.find(p => p.level === currentPrizeLevel)?.name }}！
                    </p>
                  </template>
                </div>
              </div>
              <div v-else key="placeholder" class="text-4xl font-bold text-white opacity-50">
                点击开始
              </div>
            </transition>
          </div>
          
          <button
            @click="toggleDraw"
            :disabled="!canDraw"
            class="px-8 py-3 bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:cursor-not-allowed text-white text-lg rounded-xl transition-all transform hover:scale-105 active:scale-95"
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
