import { useState, useEffect } from 'react'
import * as api from '../api/workflowApi.js'

export default function StepEditor({ workflowId, step, onSaved, onClose }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    assignee: '',
    targetStartDate: '',
    targetEndDate: '',
    actualStartDate: '',
    actualEndDate: '',
    progress: 0,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (step) {
      setForm({
        title: step.title ?? '',
        description: step.description ?? '',
        assignee: step.assignee ?? '',
        targetStartDate: step.targetStartDate
          ? step.targetStartDate.substring(0, 10)
          : '',
        targetEndDate: step.targetEndDate
          ? step.targetEndDate.substring(0, 10)
          : '',
        actualStartDate: step.actualStartDate
          ? step.actualStartDate.substring(0, 10)
          : '',
        actualEndDate: step.actualEndDate
          ? step.actualEndDate.substring(0, 10)
          : '',
        progress: step.progress ?? 0,
      })
    }
  }, [step])

  useEffect(() => {
    // Focus the title input when modal opens
    const titleInput = document.getElementById('step-title')
    titleInput?.focus()
  }, [])

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const payload = {
        title: form.title.trim() || undefined,
        description: form.description.trim() || undefined,
        assignee: form.assignee.trim() || undefined,
        targetStartDate: form.targetStartDate || undefined,
        targetEndDate: form.targetEndDate || undefined,
        actualStartDate: form.actualStartDate || undefined,
        actualEndDate: form.actualEndDate || undefined,
        progress: Number(form.progress),
      }
      const updatedWorkflow = await api.updateStep(
        workflowId,
        step.id,
        payload
      )
      onSaved(updatedWorkflow)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Edit Step</h2>
            <p className="text-xs text-gray-500 mt-0.5">{step?.type}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
            aria-label="Close dialog"
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

        <form
          id="step-editor-form"
          onSubmit={handleSave}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-4"
        >
          <div>
            <label htmlFor="step-title" className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
              Title
            </label>
            <input
              id="step-title"
              type="text"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              placeholder="Step title"
            />
          </div>

          <div>
            <label htmlFor="step-description" className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
              Description
            </label>
            <textarea
              id="step-description"
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
              placeholder="Step description"
            />
          </div>

          <div>
            <label htmlFor="step-assignee" className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
              Assignee
            </label>
            <input
              id="step-assignee"
              type="text"
              value={form.assignee}
              onChange={(e) => handleChange('assignee', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              placeholder="Assigned to"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="step-target-start" className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                Target Start
              </label>
              <input
                id="step-target-start"
                type="date"
                value={form.targetStartDate}
                onChange={(e) => handleChange('targetStartDate', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="step-target-end" className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                Target End
              </label>
              <input
                id="step-target-end"
                type="date"
                value={form.targetEndDate}
                onChange={(e) => handleChange('targetEndDate', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="step-actual-start" className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                Actual Start
              </label>
              <input
                id="step-actual-start"
                type="date"
                value={form.actualStartDate}
                onChange={(e) =>
                  handleChange('actualStartDate', e.target.value)
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="step-actual-end" className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                Actual End
              </label>
              <input
                id="step-actual-end"
                type="date"
                value={form.actualEndDate}
                onChange={(e) => handleChange('actualEndDate', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label htmlFor="step-progress" className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
              Progress
            </label>
            <div className="flex items-center gap-3">
              <input
                id="step-progress"
                type="range"
                min={0}
                max={100}
                value={form.progress}
                onChange={(e) =>
                  handleChange('progress', Number(e.target.value))
                }
                className="flex-1 h-2 rounded-full accent-blue-500 cursor-pointer"
              />
              <input
                type="number"
                min={0}
                max={100}
                value={form.progress}
                onChange={(e) =>
                  handleChange(
                    'progress',
                    Math.min(100, Math.max(0, Number(e.target.value)))
                  )
                }
                className="w-16 border border-gray-300 rounded-md px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                aria-label="Progress value"
              />
              <span className="text-sm text-gray-500">%</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md px-3 py-2">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </form>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-medium text-gray-600 hover:text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="step-editor-form"
            disabled={saving}
            className="text-sm font-medium bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-5 py-2 rounded-md transition-colors"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
