const TYPE_COLORS = {
  REQUIREMENT:    { light: 'bg-purple-200', dark: 'bg-purple-500' },
  ARCHITECTURE:   { light: 'bg-indigo-200', dark: 'bg-indigo-500' },
  DESIGN:         { light: 'bg-pink-200',   dark: 'bg-pink-500'   },
  DEVELOPMENT:    { light: 'bg-blue-200',   dark: 'bg-blue-500'   },
  IMPLEMENTATION: { light: 'bg-teal-200',   dark: 'bg-teal-500'   },
}

const DEFAULT_COLORS = { light: 'bg-gray-200', dark: 'bg-gray-400' }

function parseDate(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  return isNaN(d) ? null : d
}

export default function WorkflowTimeline({ workflow, selectedStep, onStepClick }) {
  const steps = workflow?.steps ?? []

  // Collect all non-null dates across all steps
  const allDates = []
  for (const step of steps) {
    for (const field of ['targetStartDate', 'targetEndDate', 'actualStartDate', 'actualEndDate']) {
      const d = parseDate(step[field])
      if (d) allDates.push(d)
    }
  }

  if (allDates.length === 0) {
    return (
      <div className="mt-6 bg-white rounded-lg border border-gray-200 p-10 text-center">
        <p className="text-sm font-medium text-gray-500">No dates have been set on any steps yet.</p>
        <p className="text-xs text-gray-400 mt-1">Use Edit Step to add target or actual dates, then switch back to Timeline.</p>
      </div>
    )
  }

  // Compute range with a 3-day padding on each side
  const minDate = new Date(Math.min(...allDates))
  const maxDate = new Date(Math.max(...allDates))
  const paddedMin = new Date(minDate)
  paddedMin.setDate(paddedMin.getDate() - 3)
  const paddedMax = new Date(maxDate)
  paddedMax.setDate(paddedMax.getDate() + 3)

  const totalMs = paddedMax - paddedMin

  function toPercent(date) {
    return ((date - paddedMin) / totalMs) * 100
  }

  // Generate one tick per month across the range
  const ticks = []
  const cursor = new Date(paddedMin.getFullYear(), paddedMin.getMonth(), 1)
  while (cursor <= paddedMax) {
    ticks.push(new Date(cursor))
    cursor.setMonth(cursor.getMonth() + 1)
  }

  // Returns { left, width } style object for a bar, or null if not renderable
  function barStyle(start, end) {
    if (!start || !end) return null
    const left = Math.max(0, toPercent(start))
    const right = Math.min(100, toPercent(end))
    if (right <= left) return null
    return { left: `${left}%`, width: `${right - left}%` }
  }

  return (
    <div className="mt-6">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">

        {/* ── Month axis header ─────────────────────────────────────────── */}
        <div className="flex border-b border-gray-200">
          <div className="w-40 shrink-0 border-r border-gray-200 bg-gray-50 px-3 py-2 flex items-end">
            <span className="text-xs font-semibold text-gray-500">Step</span>
          </div>
          <div className="flex-1 relative h-8 bg-gray-50 overflow-hidden">
            {ticks.map((tick) => {
              const pct = toPercent(tick)
              if (pct < 0 || pct > 102) return null
              return (
                <div
                  key={tick.toISOString()}
                  className="absolute inset-y-0 flex flex-col justify-end pb-1"
                  style={{ left: `${pct}%` }}
                >
                  <div className="absolute inset-y-0 left-0 w-px bg-gray-200" />
                  <span className="relative text-xs text-gray-400 whitespace-nowrap pl-1.5 leading-none">
                    {tick.toLocaleDateString(undefined, { month: 'short', year: '2-digit' })}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Step rows ────────────────────────────────────────────────── */}
        {steps.map((step) => {
          const isActive = selectedStep?.id === step.id
          const colors = TYPE_COLORS[step.type] ?? DEFAULT_COLORS
          const targetS = barStyle(parseDate(step.targetStartDate), parseDate(step.targetEndDate))
          const actualS = barStyle(parseDate(step.actualStartDate), parseDate(step.actualEndDate))

          return (
            <div
              key={step.id}
              onClick={() => onStepClick(step)}
              className={`flex border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors hover:bg-gray-50 ${
                isActive ? 'bg-blue-50' : ''
              }`}
            >
              {/* Label column */}
              <div
                className={`w-40 shrink-0 border-r border-gray-100 px-3 py-2 flex flex-col justify-center gap-0.5 ${
                  isActive ? 'ring-1 ring-inset ring-blue-300' : ''
                }`}
              >
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide truncate">
                  {step.type}
                </span>
                <span className="text-xs text-gray-700 truncate">
                  {step.title || step.type}
                </span>
              </div>

              {/* Chart column */}
              <div className="flex-1 relative py-2 px-1 overflow-hidden" style={{ minHeight: '52px' }}>
                {/* Vertical grid lines aligned to month ticks */}
                {ticks.map((tick) => {
                  const pct = toPercent(tick)
                  if (pct < 0 || pct > 100) return null
                  return (
                    <div
                      key={tick.toISOString()}
                      className="absolute inset-y-0 w-px bg-gray-100"
                      style={{ left: `${pct}%` }}
                    />
                  )
                })}

                {/* Target bar (light) */}
                <div className="relative h-5 mb-1">
                  {targetS && (
                    <div
                      className={`absolute top-0.5 h-4 rounded-full ${colors.light}`}
                      style={{ ...targetS, minWidth: '4px' }}
                      title={`Target: ${step.targetStartDate} → ${step.targetEndDate}`}
                    />
                  )}
                </div>

                {/* Actual bar (saturated) */}
                <div className="relative h-5">
                  {actualS && (
                    <div
                      className={`absolute top-0.5 h-4 rounded-full ${colors.dark}`}
                      style={{ ...actualS, minWidth: '4px' }}
                      title={`Actual: ${step.actualStartDate} → ${step.actualEndDate}`}
                    />
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {/* ── Legend ───────────────────────────────────────────────────── */}
        <div className="flex items-center gap-5 px-4 py-2.5 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-3 rounded-full bg-blue-200" />
            <span className="text-xs text-gray-500">Target dates</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-3 rounded-full bg-blue-500" />
            <span className="text-xs text-gray-500">Actual dates</span>
          </div>
        </div>
      </div>
    </div>
  )
}
