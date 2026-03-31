'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '@/stores/settings-store';

interface SettingsPanelProps {
  onClose: () => void;
}

export default function SettingsPanel({ onClose }: SettingsPanelProps) {
  const {
    theme,
    showFingerGuide,
    showKeyboard,
    soundEnabled,
    soundVolume,
    fontSize,
    koreanLayout,
    updateSetting,
  } = useSettingsStore();

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-800">
            <h2 className="text-lg font-bold text-white">Settings</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-5 space-y-6">
            {/* ── Sound ── */}
            <section>
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
                Sound
              </h3>
              <div className="space-y-4">
                {/* Sound toggle */}
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-300">Sound Effects</label>
                  <button
                    onClick={() => updateSetting('soundEnabled', !soundEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      soundEnabled ? 'bg-amber-500' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        soundEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Volume slider */}
                {soundEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-3"
                  >
                    <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={soundVolume}
                      onChange={(e) => updateSetting('soundVolume', parseFloat(e.target.value))}
                      className="flex-1 h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-amber-500"
                    />
                    <span className="text-xs text-gray-500 w-8 text-right tabular-nums">
                      {Math.round(soundVolume * 100)}%
                    </span>
                  </motion.div>
                )}
              </div>
            </section>

            {/* ── Keyboard ── */}
            <section>
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
                Keyboard
              </h3>
              <div className="space-y-4">
                {/* Layout selector */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Keyboard Layout
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'qwerty' as const, label: 'QWERTY / 두벌식' },
                      { value: 'dvorak' as const, label: 'Dvorak' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => updateSetting('koreanLayout', opt.value)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                          koreanLayout === opt.value
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                            : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Finger guide toggle */}
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-300">Show Finger Guide</label>
                  <button
                    onClick={() => updateSetting('showFingerGuide', !showFingerGuide)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      showFingerGuide ? 'bg-amber-500' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        showFingerGuide ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Key highlight toggle */}
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-300">Show Key Highlight</label>
                  <button
                    onClick={() => updateSetting('showKeyboard', !showKeyboard)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      showKeyboard ? 'bg-amber-500' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        showKeyboard ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </section>

            {/* ── Display ── */}
            <section>
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
                Display
              </h3>
              <div className="space-y-4">
                {/* Theme */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Theme</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['dark', 'light', 'system'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => updateSetting('theme', t)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors capitalize ${
                          theme === t
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                            : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
                        }`}
                      >
                        {t === 'dark' ? '🌙 Dark' : t === 'light' ? '☀️ Light' : '💻 System'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font size */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Font Size</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['small', 'medium', 'large'] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => updateSetting('fontSize', size)}
                        className={`px-3 py-2 rounded-lg border transition-colors capitalize ${
                          fontSize === size
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                            : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
                        } ${
                          size === 'small' ? 'text-xs' : size === 'medium' ? 'text-sm' : 'text-base'
                        } font-medium`}
                      >
                        {size === 'small' ? 'Small' : size === 'medium' ? 'Medium' : 'Large'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-gray-800">
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold rounded-lg transition-colors text-sm"
            >
              Done
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
