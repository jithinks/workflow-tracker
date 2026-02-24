const STEP_ORDER = [
  'REQUIREMENT',
  'ARCHITECTURE',
  'DESIGN',
  'DEVELOPMENT',
  'IMPLEMENTATION',
]

const TYPE_LABELS = {
  REQUIREMENT: 'Req',
  ARCHITECTURE: 'Arch',
  DESIGN: 'Design',
  DEVELOPMENT: 'Dev',
  IMPLEMENTATION: 'Impl',
}

const TYPE_FULL_LABELS = {
  REQUIREMENT: 'Requirement',
  ARCHITECTURE: 'Architecture',
  DESIGN: 'Design',
  DEVELOPMENT: 'Development',
  IMPLEMENTATION: 'Implementation',
}

function stepColor(progress) {
  if (progress === 100) return 'completed'
  if (progress > 0) return 'in-progress'
  return 'not-started'
}

function StepNode({ step, onClick, isLast }) {
  const color = stepColor(step?.progress ?? 0)
  const progress = step?.progress ?? 0

  const circleBase =
    'w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2 cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-md select-none relative'

  const circleStyle =
    color === 'completed'
      ? `${circleBase} bg-green-500 border-green-500 text-white shadow-green-200 shadow-sm`
      : color === 'in-progress'
      ? `${circleBase} bg-blue-400 border-blue-400 text-white shadow-blue-200 shadow-sm`
      : `${circleBase} bg-gray-100 border-gray-300 text-gray-400`

  const connectorStyle =
    color === 'completed'
      ? 'flex-1 h-1 bg-green-400 rounded-full'
      : color === 'in-progress'
      ? 'flex-1 h-1 bg-blue-300 rounded-full'
      : 'flex-1 h-1 bg-gray-200 rounded-full'

  return (
    <div className="flex items-center flex-1 min-w-0">
      <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
        <button
          onClick={() => step && onClick(step)}
          className={circleStyle}
          title={step ? `${TYPE_FULL_LABELS[step.type]} — ${progress}%` : ''}
        >
          {color === 'completed' ? (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <span>{TYPE_LABELS[step?.type] || '?'}</span>
          )}
        </button>
        <div className="text-center w-16">
          <p className="text-xs font-medium text-gray-600 leading-tight truncate">
            {TYPE_FULL_LABELS[step?.type] || ''}
          </p>
          <p
            className={`text-xs font-semibold ${
              color === 'completed'
                ? 'text-green-600'
                : color === 'in-progress'
                ? 'text-blue-500'
                : 'text-gray-400'
            }`}
          >
            {progress}%
          </p>
        </div>
      </div>
      {!isLast && <div className={`${connectorStyle} mx-1 -mt-6`} />}
    </div>
  )
}

export default function WorkflowCard({ workflow, onStepClick, onDelete }) {
  const stepsMap = {}
  for (const s of workflow.steps ?? []) {
    stepsMap[s.type] = s
  }

  const overallProgress =
    workflow.steps && workflow.steps.length > 0
      ? Math.round(
          workflow.steps.reduce((sum, s) => sum + (s.progress ?? 0), 0) /
            workflow.steps.length
        )
      : 0

  const completedCount = (workflow.steps ?? []).filter(
    (s) => (s.progress ?? 0) === 100
  ).length
  const totalCount = workflow.steps?.length ?? 0

  function formatDate(dateStr) {
    if (!dateStr) return null
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return null
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Card header */}
      <div className="flex items-start justify-between mb-1">
        <div className="flex-1 min-w-0 pr-4">
          <h3 className="text-lg font-semibold text-gray-800 truncate">
            {workflow.name}
          </h3>
          {workflow.description && (
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
              {workflow.description}
            </p>
          )}
        </div>
        <button
          onClick={() => onDelete(workflow.id)}
          className="shrink-0 text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-md hover:bg-red-50"
          title="Delete workflow"
          aria-label="Delete workflow"
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
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-3 mb-5 mt-2">
        {workflow.createdAt && (
          <span className="text-xs text-gray-400">
            Created {formatDate(workflow.createdAt)}
          </span>
        )}
        <span className="text-xs bg-gray-100 text-gray-600 font-medium px-2 py-0.5 rounded-full">
          {completedCount}/{totalCount} steps done
        </span>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            overallProgress === 100
              ? 'bg-green-100 text-green-700'
              : overallProgress > 0
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          {overallProgress}% overall
        </span>
      </div>

      {/* Stepper */}
      <div className="flex items-start">
        {STEP_ORDER.map((type, index) => (
          <StepNode
            key={type}
            step={stepsMap[type] ?? { type, progress: 0 }}
            onClick={onStepClick}
            isLast={index === STEP_ORDER.length - 1}
          />
        ))}
      </div>

      {/* Overall progress bar */}
      <div className="mt-5 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                overallProgress === 100 ? 'bg-green-500' : 'bg-blue-400'
              }`}
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-gray-500 w-8 text-right shrink-0">
            {overallProgress}%
          </span>
        </div>
      </div>
    </div>
  )
}
