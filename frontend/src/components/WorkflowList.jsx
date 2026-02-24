function overallProgress(workflow) {
  const steps = workflow.steps ?? []
  if (steps.length === 0) return 0
  return Math.round(
    steps.reduce((sum, s) => sum + (s.progress ?? 0), 0) / steps.length
  )
}

function statusDot(progress) {
  if (progress === 100)
    return <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
  if (progress > 0)
    return <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
  return <span className="w-2 h-2 rounded-full bg-gray-300 shrink-0" />
}

export default function WorkflowList({
  workflows,
  onSelect,
  selectedId,
  onNewWorkflow,
}) {
  return (
    <div className="h-full flex flex-col bg-gray-50 border-r border-gray-200">
      {/* Sidebar header */}
      <div className="px-4 pt-5 pb-4 border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h1 className="text-base font-bold text-gray-800 leading-tight">
            Workflow Tracker
          </h1>
        </div>
        <button
          onClick={onNewWorkflow}
          className="w-full flex items-center justify-center gap-2 text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors shadow-sm"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Workflow
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto py-2">
        {workflows.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-gray-400">No workflows yet.</p>
            <p className="text-xs text-gray-400 mt-1">
              Click "New Workflow" to get started.
            </p>
          </div>
        )}
        {workflows.map((w) => {
          const progress = overallProgress(w)
          const isSelected = w.id === selectedId
          return (
            <button
              key={w.id}
              onClick={() => onSelect(w.id)}
              className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors border-l-2 ${
                isSelected
                  ? 'bg-blue-50 border-blue-500'
                  : 'border-transparent hover:bg-gray-100'
              }`}
            >
              {statusDot(progress)}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium truncate ${
                    isSelected ? 'text-blue-700' : 'text-gray-700'
                  }`}
                >
                  {w.name}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{progress}% complete</p>
              </div>
              {isSelected && (
                <svg
                  className="w-4 h-4 text-blue-400 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
            </button>
          )
        })}
      </div>

      {/* Footer */}
      {workflows.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 shrink-0">
          <p className="text-xs text-gray-400 text-center">
            {workflows.length} workflow{workflows.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  )
}
