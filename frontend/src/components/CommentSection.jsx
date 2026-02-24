import { useState } from 'react'
import * as api from '../api/workflowApi.js'

export default function CommentSection({
  workflowId,
  stepId,
  comments,
  onCommentAdded,
  onCommentDeleted,
}) {
  const [author, setAuthor] = useState('')
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState(null)

  const sortedComments = [...(comments ?? [])].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  )

  async function handleAdd(e) {
    e.preventDefault()
    if (!author.trim() || !text.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      await api.addComment(workflowId, stepId, text.trim(), author.trim())
      setAuthor('')
      setText('')
      onCommentAdded()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(commentId) {
    setDeletingId(commentId)
    setError(null)
    try {
      await api.deleteComment(workflowId, stepId, commentId)
      onCommentDeleted()
    } catch (err) {
      setError(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return ''
    try {
      return new Date(dateStr).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="mt-4">
      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1">
        <svg
          className="w-4 h-4 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        Comments ({sortedComments.length})
      </h4>

      {sortedComments.length === 0 && (
        <p className="text-xs text-gray-400 italic mb-3">No comments yet.</p>
      )}

      <div className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-1">
        {sortedComments.map((c) => (
          <div
            key={c.id}
            className="bg-gray-50 border border-gray-100 rounded-lg p-3 relative group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-gray-700">
                {c.author}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">
                  {formatDate(c.createdAt)}
                </span>
                <button
                  onClick={() => handleDelete(c.id)}
                  disabled={deletingId === c.id}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 disabled:opacity-50"
                  title="Delete comment"
                  aria-label="Delete comment"
                >
                  {deletingId === c.id ? (
                    <svg
                      className="w-3.5 h-3.5 animate-spin"
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
                  ) : (
                    <svg
                      className="w-3.5 h-3.5"
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
                  )}
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{c.text}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleAdd} className="space-y-2">
        <input
          type="text"
          placeholder="Your name"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
          className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder-gray-400"
        />
        <input
          type="text"
          placeholder="Write a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder-gray-400"
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={submitting || !author.trim() || !text.trim()}
          className="w-full text-sm bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          {submitting ? 'Adding...' : 'Add Comment'}
        </button>
      </form>
    </div>
  )
}
