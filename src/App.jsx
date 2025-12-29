import { useState, useEffect, useRef } from 'react'
import './App.css'
import { Slider } from '@/components/ui/slider'
import { Play, Pause } from 'lucide-react'

// プリセット色の定義（8種類）
const PRESET_COLORS = [
  { id: 1, name: '', color: '#ef4444' },
  { id: 2, name: '', color: '#3b82f6' },
  { id: 3, name: '', color: '#22c55e' },
  { id: 4, name: '', color: '#eab308' },
  { id: 5, name: '', color: '#a855f7' },
  { id: 6, name: '', color: '#f97316' },
  { id: 7, name: '', color: '#ec4899' },
  { id: 8, name: '', color: '#06b6d4' },
]

function App() {
  // 選択された色のIDを管理（4〜8種類まで選択可能）
  const [selectedColors, setSelectedColors] = useState([1, 2])
  // 現在表示中の色のインデックス
  const [currentColorIndex, setCurrentColorIndex] = useState(0)
  // 一時停止状態
  const [isPaused, setIsPaused] = useState(false)
  // スライダーの値（速度：7000ms〜1000ms、デフォルト4000ms）
  // スライダーは1〜100の値で、これを7000ms〜1000msに変換（右に行くほど速い）
  const [speedValue, setSpeedValue] = useState([50]) // 50 = 約4000ms
  const intervalRef = useRef(null)

  // スライダーの値をミリ秒に変換（1〜100 → 7000ms〜1000ms、右に行くほど速い）
  const speedInMs = 7000 - (speedValue[0] - 1) * (6000 / 99)

  // 選択された色の配列を取得
  const selectedColorsArray = PRESET_COLORS.filter(color => 
    selectedColors.includes(color.id)
  )

  // 選択された色が変更されたときにインデックスをリセット
  useEffect(() => {
    if (selectedColorsArray.length > 0) {
      setCurrentColorIndex(0)
    }
  }, [selectedColors])

  // 色の自動切り替えロジック
  useEffect(() => {
    // 選択された色が4種類未満の場合は実行しない
    if (selectedColors.length < 2 || selectedColorsArray.length === 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    // 一時停止中は実行しない
    if (isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    // 既存のインターバルをクリア
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // 新しいインターバルを設定
    intervalRef.current = setInterval(() => {
      setCurrentColorIndex(prevIndex => {
        // 次の色のインデックスを計算（循環）
        return (prevIndex + 1) % selectedColorsArray.length
      })
    }, speedInMs)

    // クリーンアップ
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [selectedColors, selectedColorsArray.length, isPaused, speedInMs])

  // 色の選択/選択解除を処理
  const toggleColor = (colorId) => {
    setSelectedColors(prev => {
      if (prev.includes(colorId)) {
        // 選択解除（ただし4種類未満にならないように制限）
        const newSelection = prev.filter(id => id !== colorId)
        if (newSelection.length >= 2) {
          return newSelection
        }
        return prev // 4種類未満になる場合は変更しない
      } else {
        // 選択追加（ただし8種類を超えないように制限）
        if (prev.length < 8) {
          return [...prev, colorId]
        }
        return prev // 8種類を超える場合は変更しない
      }
    })
  }

  // 一時停止/再開の切り替え
  const togglePause = () => {
    setIsPaused(prev => !prev)
  }

  // 現在表示中の色を取得
  const currentColor = selectedColorsArray[currentColorIndex] || selectedColorsArray[0]

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 画面上部の色切り替えボックス */}
        <div className="w-full">
          <div
            className="w-full h-64 md:h-80 rounded-lg shadow-lg transition-colors duration-0"
            style={{ 
              backgroundColor: currentColor?.color || '#000000',
              transition: 'background-color 0s' // 即座に切り替え
            }}
          >
            {/* 色名表示（オプション） */}
            <div className="flex items-center justify-center h-full">
              <span className="text-4xl font-bold text-white drop-shadow-lg">
                {currentColor?.name || ''}
              </span>
            </div>
          </div>
        </div>

        {/* コントロールパネル */}
        <div className="bg-gray-800 rounded-lg p-6 space-y-6">

            
          {/* 速度調整スライダー */}
          <div>
            <h2 className="text-xl font-semibold mb-4">切り替え速度</h2>
            <div className="px-4">
              <Slider
                min={1}
                max={100}
                step={1}
                value={speedValue}
                onValueChange={setSpeedValue}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-sm text-gray-400 mt-2">
              <span>遅い（7秒）</span>
              <span className="font-semibold text-white">
                {speedInMs >= 1000 
                  ? `${(speedInMs / 1000).toFixed(1)}秒` 
                  : `${Math.round(speedInMs)}ms`}
              </span>
              <span>速い（1秒）</span>
            </div>
          </div>

          {/* 一時停止ボタン */}
          <div className="flex justify-center">
            <button
              onClick={togglePause}
              disabled={selectedColors.length < 2}
              className={`
                px-6 py-3 rounded-lg font-semibold transition-all
                flex items-center gap-2
                ${isPaused
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
                }
                ${selectedColors.length < 2
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer'
                }
              `}
              style={{
                color: 'rgba(30, 26, 26, 1)',
                backgroundColor: 'rgba(255, 255, 255, 1)'
              }}
            >
              {isPaused ? (
                <>
                  <Play className="w-5 h-5" />
                  <span>再開</span>
                </>
              ) : (
                <>
                  <Pause className="w-5 h-5" />
                  <span>一時停止</span>
                </>
              )}
            </button>
          </div>


          {/* 色選択エリア */}
          <div>
            <h2 className="text-xl font-semibold mb-4">色を選択</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {PRESET_COLORS.map(color => {
                const isSelected = selectedColors.includes(color.id)
                const isDisabled = !isSelected && selectedColors.length >= 8
                const cannotDeselect = isSelected && selectedColors.length <= 1

                return (
                  <button
                    key={color.id}
                    onClick={() => toggleColor(color.id)}
                    disabled={isDisabled || cannotDeselect}
                    className={`
                      p-4 rounded-lg border-2 transition-all
                      ${isSelected 
                        ? 'border-white bg-gray-700 scale-105' 
                        : 'border-gray-600 bg-gray-700/50 opacity-60'
                      }
                      ${isDisabled || cannotDeselect 
                        ? 'cursor-not-allowed opacity-40' 
                        : 'cursor-pointer hover:scale-105 hover:opacity-100'
                      }
                    `}
                  >
                    <div
                      className="w-full h-16 rounded mb-2"
                      style={{ backgroundColor: color.color }}
                    />
                    <div className="text-sm font-medium">{color.name}</div>
                    {isSelected && (
                      <div className="text-xs text-green-400 mt-1">✓ 選択中</div>
                    )}
                  </button>
                )
              })}
            </div>
            {selectedColors.length < 2 && (
              <p className="text-yellow-400 text-sm mt-2">
                警告: 最低4種類の色を選択してください（現在: {selectedColors.length}種類）
              </p>
            )}
          </div>



        </div>
      </div>
    </div>
  )
}

export default App
