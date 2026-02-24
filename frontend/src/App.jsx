import { useState, useEffect, useCallback } from 'react'
import * as api from './api/workflowApi.js'
import WorkflowList from './components/WorkflowList.jsx'
import WorkflowCard from './components/WorkflowCard.jsx'
import StepPanel from './components/StepPanel.jsx'
import CreateWorkflowModal from './components/CreateWorkflowModal.jsx'
import WorkflowTimeline from './components/WorkflowTimeline.jsx'

export default function App() {
  const [workflows, setWorkflows] = useState([])
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(null)
  const [selectedStep, setSelectedStep] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [viewMode, setViewMode] = useState('list')

  // ─── Initial load ───────────────────────────────────────────────────────────
  useEffect(() => {
    loadWorkflows()
  }, [])

  async function loadWorkflows() {
    setLoading(true)
    setFetchError(null)
    try {
      const data = await api.getWorkflows()
      setWorkflows(data ?? [])
    } catch (err) {
      setFetchError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ─── Re-fetch a single workflow and patch it into state ──────────────────────
  const refreshWorkflow = useCallback(
    async (workflowId) => {
      try {
        const updated = await api.getWorkflow(workflowId)
        setWorkflows((prev) =>
          prev.map((w) => (w.id === workflowId ? updated : w))
        )
        // If there is an active selected step in this workflow, keep it in sync
        // Note: selectedStep is accessed from closure; dependency array is intentionally empty
        setSelectedStep((prevStep) => {
          if (prevStep) {
            const refreshedStep = updated.steps?.find(
              (s) => s.id === prevStep.id
            )
            return refreshedStep || prevStep
          }
          return prevStep
        })
      } catch (err) {
        console.error('Failed to refresh workflow:', err)
      }
    },
    []
  )

  // ─── Reset view mode when the selected workflow changes ─────────────────────
  useEffect(() => {
    setViewMode('list')
  }, [selectedWorkflowId])

  // ─── Select a workflow ───────────────────────────────────────────────────────
  function handleSelectWorkflow(id) {
    setSelectedWorkflowId(id)
    setSelectedStep(null)
  }

  // ─── Step click ─────────────────────────────────────────────────────────────
  function handleStepClick(step) {
    setSelectedStep((prev) => (prev?.id === step.id ? null : step))
  }

  // ─── Step panel close ───────────────────────────────────────────────────────
  function handleStepPanelClose() {
    setSelectedStep(null)
  }

  // ─── Step saved (StepEditor → StepPanel callback) ───────────────────────────
  async function handleStepSaved(updatedWorkflowFromApi) {
    // The PUT step endpoint may return the updated workflow directly;
    // if it does, use it. Otherwise re-fetch.
    if (updatedWorkflowFromApi && updatedWorkflowFromApi.id) {
      setWorkflows((prev) =>
        prev.map((w) =>
          w.id === updatedWorkflowFromApi.id ? updatedWorkflowFromApi : w
        )
      )
      if (selectedStep) {
        const refreshedStep = updatedWorkflowFromApi.steps?.find(
          (s) => s.id === selectedStep.id
        )
        if (refreshedStep) setSelectedStep(refreshedStep)
      }
    } else {
      await refreshWorkflow(selectedWorkflowId)
    }
  }

  // ─── Comment added or deleted (CommentSection → StepPanel callback) ──────────
  async function handleCommentChanged() {
    await refreshWorkflow(selectedWorkflowId)
  }

  // ─── Create workflow ────────────────────────────────────────────────────────
  function handleWorkflowCreated(newWorkflow) {
    setWorkflows((prev) => [newWorkflow, ...prev])
    setSelectedWorkflowId(newWorkflow.id)
    setSelectedStep(null)
    setShowCreateModal(false)
  }

  // ─── Delete workflow ────────────────────────────────────────────────────────
  async function handleDeleteWorkflow(workflowId) {
    if (deletingId) return
    const workflow = workflows.find((w) => w.id === workflowId)
    if (
      !window.confirm(
        `Delete workflow "${workflow?.name ?? workflowId}"? This cannot be undone.`
      )
    ) {
      return
    }
    setDeletingId(workflowId)
    try {
      await api.deleteWorkflow(workflowId)
      setWorkflows((prev) => prev.filter((w) => w.id !== workflowId))
      if (selectedWorkflowId === workflowId) {
        setSelectedWorkflowId(null)
        setSelectedStep(null)
      }
    } catch (err) {
      alert(`Failed to delete workflow: ${err.message}`)
    } finally {
      setDeletingId(null)
    }
  }

  // ─── Derived state ───────────────────────────────────────────────────────────
  const selectedWorkflow = workflows.find((w) => w.id === selectedWorkflowId) ?? null

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <div className="w-72 shrink-0 h-full">
        <WorkflowList
          workflows={workflows}
          onSelect={handleSelectWorkflow}
          selectedId={selectedWorkflowId}
          onNewWorkflow={() => setShowCreateModal(true)}
        />
      </div>

      {/* Main content area */}
      <div
        className={`flex-1 min-w-0 flex flex-col h-full transition-all duration-300`}
      >
        {/* Top bar */}
        <div className="shrink-0 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div>
            {selectedWorkflow ? (
              <>
                <h2 className="text-base font-semibold text-gray-800">
                  {selectedWorkflow.name}
                </h2>
                {selectedWorkflow.description && (
                  <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xl">
                    {selectedWorkflow.description}
                  </p>
                )}
              </>
            ) : (
              <h2 className="text-base font-semibold text-gray-500">
                Select a workflow from the sidebar
              </h2>
            )}
          </div>
          <button
            onClick={loadWorkflows}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50"
            title="Refresh workflows"
            aria-label="Refresh workflows"
          >
            <svg
              className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>

        {/* Content + right panel */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Scrollable workflow area */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading && (
              <div className="flex flex-col items-center justify-center h-64 gap-3">
                <svg
                  className="w-8 h-8 text-blue-400 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                <p className="text-sm text-gray-400">Loading workflows...</p>
              </div>
            )}

            {!loading && fetchError && (
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md w-full text-center">
                  <p className="text-sm font-medium text-red-700 mb-1">
                    Failed to load workflows
                  </p>
                  <p className="text-xs text-red-500 mb-4">{fetchError}</p>
                  <button
                    onClick={loadWorkflows}
                    className="text-sm font-medium bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {!loading && !fetchError && !selectedWorkflow && (
              <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                {workflows.length === 0 ? (
                  <>
                    <p className="text-base font-medium text-gray-600">
                      No workflows yet
                    </p>
                    <p className="text-sm text-gray-400 max-w-xs">
                      Create your first workflow to start tracking progress
                      across all stages.
                    </p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-md transition-colors"
                    >
                      Create Workflow
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-base font-medium text-gray-600">
                      Select a workflow
                    </p>
                    <p className="text-sm text-gray-400">
                      Choose a workflow from the sidebar to view its details.
                    </p>
                  </>
                )}
              </div>
            )}

            {!loading && !fetchError && selectedWorkflow && (
              <div className="max-w-4xl">
                <WorkflowCard
                  workflow={selectedWorkflow}
                  onStepClick={handleStepClick}
                  onDelete={handleDeleteWorkflow}
                />

                {/* View mode toggle */}
                <div className="flex gap-2 mt-6 mb-4">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      viewMode === 'list'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    List
                  </button>
                  <button
                    onClick={() => setViewMode('timeline')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      viewMode === 'timeline'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Timeline
                  </button>
                </div>

                {/* Step list */}
                {viewMode === 'list' && (
                  <div className="grid grid-cols-1 gap-3">
                    {(selectedWorkflow.steps ?? []).map((step) => {
                      const isActive = selectedStep?.id === step.id
                      const progress = step.progress ?? 0
                      return (
                        <button
                          key={step.id}
                          onClick={() => handleStepClick(step)}
                          className={`w-full text-left bg-white rounded-lg border px-4 py-3 flex items-center gap-4 transition-all hover:shadow-sm ${
                            isActive
                              ? 'border-blue-400 shadow-sm ring-1 ring-blue-300'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {/* Status indicator */}
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                              progress === 100
                                ? 'bg-green-500 text-white'
                                : progress > 0
                                ? 'bg-blue-400 text-white'
                                : 'bg-gray-100 text-gray-400'
                            }`}
                          >
                            {progress === 100 ? (
                              <svg
                                className="w-4 h-4"
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
                              <span>{progress}</span>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                {step.type}
                              </span>
                              {step.assignee && (
                                <span className="text-xs text-gray-400">
                                  · {step.assignee}
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-medium text-gray-700 truncate">
                              {step.title || step.type}
                            </p>
                          </div>

                          <div className="w-24 shrink-0">
                            <div className="flex items-center gap-1.5">
                              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    progress === 100
                                      ? 'bg-green-500'
                                      : 'bg-blue-400'
                                  }`}
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500 w-7 text-right">
                                {progress}%
                              </span>
                            </div>
                          </div>

                          <svg
                            className={`w-4 h-4 shrink-0 transition-colors ${
                              isActive ? 'text-blue-400' : 'text-gray-300'
                            }`}
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
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Timeline (Gantt) view */}
                {viewMode === 'timeline' && (
                  <WorkflowTimeline
                    workflow={selectedWorkflow}
                    selectedStep={selectedStep}
                    onStepClick={handleStepClick}
                  />
                )}
              </div>
            )}
          </div>

          {/* Right panel — slides in when a step is selected */}
          <div
            className={`shrink-0 border-l border-gray-200 bg-white transition-all duration-300 overflow-hidden ${
              selectedStep ? 'w-80' : 'w-0'
            }`}
          >
            {selectedStep && selectedWorkflow && (
              <StepPanel
                workflowId={selectedWorkflow.id}
                step={selectedStep}
                onStepUpdated={handleStepSaved}
                onClose={handleStepPanelClose}
              />
            )}
          </div>
        </div>
      </div>

      {/* Create workflow modal */}
      {showCreateModal && (
        <CreateWorkflowModal
          onCreated={handleWorkflowCreated}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  )
}
