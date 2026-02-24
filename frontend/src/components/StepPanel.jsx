import { useState } from 'react'
import ProgressBar from './ProgressBar.jsx'
import CommentSection from './CommentSection.jsx'
import StepEditor from './StepEditor.jsx'

const TYPE_STYLES = {
  REQUIREMENT: 'bg-purple-100 text-purple-700 border-purple-200',
  ARCHITECTURE: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  DESIGN: 'bg-pink-100 text-pink-700 border-pink-200',
  DEVELOPMENT: 'bg-blue-100 text-blue-700 border-blue-200',
  IMPLEMENTATION: 'bg-teal-100 text-teal-700 border-teal-200',
}

const TYPE_LABELS = {
  REQUIREMENT: 'Requirement',
  ARCHITECTURE: 'Architecture',
  DESIGN: 'Design',
  DEVELOPMENT: 'Development',
  IMPLEMENTATION: 'Implementation',
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr)
    if (isNaN(d)) return dateStr
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function DateRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-xs font-medium text-gray-700">{formatDate(value)}</span>
    </div>
  )
}

export default function StepPanel({ workflowId, step, onStepUpdated, onClose }) {
  const [editorOpen, setEditorOpen] = useState(false)

  if (!step) return null

  const typeStyle =
    TYPE_STYLES[step.type] || 'bg-gray-100 text-gray-700 border-gray-200'
  const typeLabel = TYPE_LABELS[step.type] || step.type

  function handleSaved(updatedWorkflow) {
    setEditorOpen(false)
    onStepUpdated(updatedWorkflow)
  }

  return (
    <>
      <div className="h-full flex flex-col bg-white border-l border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div className="flex-1 min-w-0 pr-3">
            <span
              className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full border mb-2 ${typeStyle}`}
            >
              {typeLabel}
            </span>
            <h3 className="text-base font-semibold text-gray-800 leading-tight truncate">
              {step.title || typeLabel}
            </h3>
            {step.assignee && (
              <div className="flex items-center gap-1 mt-1">
                <svg
                  className="w-3.5 h-3.5 text-gray-400 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span className="text-xs text-gray-500 truncate">
                  {step.assignee}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100 shrink-0"
            title="Close panel"
            aria-label="Close panel"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Progress */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Progress
            </p>
            <ProgressBar progress={step.progress ?? 0} />
          </div>

          {/* Description */}
          {step.description && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Description
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {step.description}
              </p>
            </div>
          )}

          {/* Dates */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Schedule
            </p>
            <div className="bg-gray-50 rounded-lg border border-gray-100 px-3 py-2 divide-y divide-gray-100">
              <DateRow label="Target Start" value={step.targetStartDate} />
              <DateRow label="Target End" value={step.targetEndDate} />
              <DateRow label="Actual Start" value={step.actualStartDate} />
              <DateRow label="Actual End" value={step.actualEndDate} />
            </div>
          </div>

          {/* Edit button */}
          <button
            onClick={() => setEditorOpen(true)}
            className="w-full flex items-center justify-center gap-2 text-sm font-medium text-blue-600 border border-blue-300 hover:bg-blue-50 rounded-md py-2 transition-colors"
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit Step
          </button>

          {/* Comments */}
          <div className="border-t border-gray-100 pt-4">
            <CommentSection
              workflowId={workflowId}
              stepId={step.id}
              comments={step.comments ?? []}
              onCommentAdded={onStepUpdated}
              onCommentDeleted={onStepUpdated}
            />
          </div>
        </div>
      </div>

      {editorOpen && (
        <StepEditor
          workflowId={workflowId}
          step={step}
          onSaved={handleSaved}
          onClose={() => setEditorOpen(false)}
        />
      )}
    </>
  )
}
