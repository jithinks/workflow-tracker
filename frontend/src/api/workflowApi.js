const BASE = '/api'

async function handleResponse(res) {
  if (!res.ok) {
    let message = `HTTP ${res.status}`
    try {
      const body = await res.json()
      message = body.message || body.error || message
    } catch {
      // ignore JSON parse errors; use status text
    }
    throw new Error(message)
  }
  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    return res.json()
  }
  return null
}

export async function getWorkflows() {
  const res = await fetch(`${BASE}/workflows`)
  return handleResponse(res)
}

export async function createWorkflow(name, description) {
  const res = await fetch(`${BASE}/workflows`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description }),
  })
  return handleResponse(res)
}

export async function getWorkflow(id) {
  const res = await fetch(`${BASE}/workflows/${id}`)
  return handleResponse(res)
}

export async function updateWorkflow(id, name, description) {
  const res = await fetch(`${BASE}/workflows/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description }),
  })
  return handleResponse(res)
}

export async function deleteWorkflow(id) {
  const res = await fetch(`${BASE}/workflows/${id}`, {
    method: 'DELETE',
  })
  return handleResponse(res)
}

export async function updateStep(workflowId, stepId, fields) {
  const res = await fetch(`${BASE}/workflows/${workflowId}/steps/${stepId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fields),
  })
  return handleResponse(res)
}

export async function addComment(workflowId, stepId, text, author) {
  const res = await fetch(
    `${BASE}/workflows/${workflowId}/steps/${stepId}/comments`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, author }),
    }
  )
  return handleResponse(res)
}

export async function deleteComment(workflowId, stepId, commentId) {
  const res = await fetch(
    `${BASE}/workflows/${workflowId}/steps/${stepId}/comments/${commentId}`,
    {
      method: 'DELETE',
    }
  )
  return handleResponse(res)
}
