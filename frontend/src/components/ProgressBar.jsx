export default function ProgressBar({ progress }) {
  const clamped = Math.min(100, Math.max(0, progress ?? 0))
  const barColor = clamped === 100 ? 'bg-green-500' : 'bg-blue-400'

  return (
    <div className="w-full">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${barColor}`}
            style={{ width: `${clamped}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-gray-600 w-9 text-right shrink-0">
          {clamped}%
        </span>
      </div>
    </div>
  )
}
