import React, { useState } from 'react'
import {
  CheckSquare,
  Clock,
  Plus,
  Sparkles,
  ExternalLink,
} from 'lucide-react'
import type { SavedNotice, ActionItem } from '../types'

interface TasksPlannerViewProps {
  notices: SavedNotice[]
  onUpdateNoticeTask: (noticeId: string, taskIndex: number, completed: boolean) => void
  onAddCustomTask: (noticeId: string, task: ActionItem) => void
  onSelectNotice: (notice: SavedNotice) => void
}

export const TasksPlannerView: React.FC<TasksPlannerViewProps> = ({
  notices,
  onUpdateNoticeTask,
  onAddCustomTask,
  onSelectNotice,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'high'>('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedNoticeId, setSelectedNoticeId] = useState(notices[0]?.id || '')
  const [newTaskText, setNewTaskText] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('medium')
  const [newTaskDeadline, setNewTaskDeadline] = useState('')

  // Flatten all tasks with their source notice
  const allTasks = notices.flatMap((n) =>
    (n.analysis.action_checklist || []).map((t, idx) => ({
      notice: n,
      taskIndex: idx,
      ...t,
    }))
  )

  const completedCount = allTasks.filter((t) => t.is_completed).length
  const totalCount = allTasks.length
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const filteredTasks = allTasks.filter((t) => {
    if (filter === 'pending') return !t.is_completed
    if (filter === 'completed') return t.is_completed
    if (filter === 'high') return t.priority === 'high' && !t.is_completed
    return true
  })

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskText.trim() || !selectedNoticeId) return

    onAddCustomTask(selectedNoticeId, {
      task: newTaskText.trim(),
      deadline: newTaskDeadline.trim() || undefined,
      priority: newTaskPriority,
      is_completed: false,
    })

    setNewTaskText('')
    setNewTaskDeadline('')
    setShowAddForm(false)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Overview Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <CheckSquare className="w-4 h-4" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              Campus Action Planner
            </h2>
          </div>
          <p className="text-xs text-slate-500 pl-10">
            Action items and deliverables aggregated across all active campus notices
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Task</span>
        </button>
      </div>

      {/* Progress Metric */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-700">Completion Progress</span>
          <span className="text-violet-700 font-bold">
            {completedCount} of {totalCount} tasks finished ({percentage}%)
          </span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-600 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Add Custom Task Form Drawer */}
      {showAddForm && (
        <form
          onSubmit={handleCreateTask}
          className="bg-violet-50/70 p-5 rounded-2xl border border-violet-200/80 space-y-3 text-xs animate-in fade-in"
        >
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-violet-600" />
            <span>Add Action Item to a Notice</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Task Description</label>
              <input
                type="text"
                required
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="e.g. Get mentor signature, print hall ticket..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Associate with Notice</label>
              <select
                value={selectedNoticeId}
                onChange={(e) => setSelectedNoticeId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
              >
                {notices.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.analysis.title.slice(0, 30)}...
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Due Date / Time (Optional)</label>
              <input
                type="text"
                value={newTaskDeadline}
                onChange={(e) => setNewTaskDeadline(e.target.value)}
                placeholder="e.g. Friday by 5 PM"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Priority Level</label>
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as 'high' | 'medium' | 'low')}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-slate-600 hover:bg-slate-200/60 rounded-lg font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold shadow-xs transition"
            >
              Save Action Item
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            filter === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Tasks ({allTasks.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('pending')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            filter === 'pending'
              ? 'bg-violet-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Pending ({totalCount - completedCount})
        </button>
        <button
          type="button"
          onClick={() => setFilter('high')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            filter === 'high'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Urgent & High
        </button>
        <button
          type="button"
          onClick={() => setFilter('completed')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            filter === 'completed'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Completed ({completedCount})
        </button>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80 space-y-2">
          <CheckSquare className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="font-bold text-slate-800 text-sm">No tasks in this view</h4>
          <p className="text-xs text-slate-500">
            All checklist tasks from your campus circulars are organized here.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredTasks.map((t, idx) => (
            <div
              key={`${t.notice.id}-${t.taskIndex}-${idx}`}
              className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                t.is_completed
                  ? 'bg-slate-50 border-slate-200 opacity-60'
                  : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-xs'
              }`}
            >
              <input
                type="checkbox"
                checked={t.is_completed}
                onChange={() => onUpdateNoticeTask(t.notice.id, t.taskIndex, !t.is_completed)}
                className="w-4 h-4 text-violet-600 rounded border-slate-300 focus:ring-violet-500 cursor-pointer mt-0.5"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    onClick={() => onSelectNotice(t.notice)}
                    className="text-[10px] font-bold text-slate-500 hover:text-violet-600 cursor-pointer flex items-center gap-1 truncate max-w-[220px]"
                  >
                    <span>{t.notice.analysis.title}</span>
                    <ExternalLink className="w-3 h-3" />
                  </span>

                  <span
                    className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                      t.priority === 'high'
                        ? 'bg-rose-100 text-rose-700'
                        : t.priority === 'medium'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {t.priority}
                  </span>
                </div>

                <p
                  className={`text-sm font-semibold mt-1 ${
                    t.is_completed ? 'line-through text-slate-400' : 'text-slate-900'
                  }`}
                >
                  {t.task}
                </p>

                {t.deadline && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Due: {t.deadline}</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
