import { useState } from 'react'

export default function App() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Read a book', done: false, dueDate: '' },
    { id: 2, text: 'Go for a walk', done: true, dueDate: '' },
    { id: 3, text: 'Write some code', done: false, dueDate: '' },
  ])
  const [input, setInput] = useState('')
  // FR2 — due date for the new-todo input row
  const [inputDueDate, setInputDueDate] = useState('')
  const [filter, setFilter] = useState('all')

  // NFR3 — message text for the aria-live announcer
  const [liveMsg, setLiveMsg] = useState('')

  // Writes a transient message into the aria-live region so screen readers
  // announce it, then clears it so the same message can fire again later.
  const announce = (msg) => {
    setLiveMsg(msg)
    setTimeout(() => setLiveMsg(''), 500)
  }

  const addTodo = () => {
    const text = input.trim()
    if (!text) return
    setTodos([...todos, { id: Date.now(), text, done: false, dueDate: inputDueDate }])
    setInput('')
    setInputDueDate('')   // FR2 — reset date field after adding
  }

  const toggleTodo = (id) =>
    setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))

  const deleteTodo = (id) => setTodos(todos.filter((t) => t.id !== id))

  // FR6 — remove all completed todos at once
  const clearCompleted = () => {
    const completed = todos.filter((t) => t.done).length
    if (completed === 0) return
    setTodos(todos.filter((t) => !t.done))
    announce(`Cleared ${completed} completed ${completed === 1 ? 'todo' : 'todos'}`)
  }

  // FR2 — update the due date of an existing todo
  const updateDueDate = (id, newDate) =>
    setTodos(todos.map((t) => (t.id === id ? { ...t, dueDate: newDate } : t)))

  const visible = todos.filter((t) =>
    filter === 'active' ? !t.done : filter === 'completed' ? t.done : true,
  )

  const remaining = todos.filter((t) => !t.done).length
  const completedCount = todos.length - remaining

  // NFR3 — filter change handler that also announces to screen readers
  const changeFilter = (name) => {
    setFilter(name)
    announce(`Showing ${name} todos`)
  }

  const tabClass = (name) =>
    `px-3 py-1 rounded-md text-sm font-medium transition ${
      filter === name
        ? 'bg-indigo-600 text-white'
        : 'text-slate-600 hover:bg-slate-200'
    }`

  // FR2 — format YYYY-MM-DD as "May 3" for display
  const formatDate = (str) => {
    if (!str) return ''
    const [y, m, d] = str.split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric',
    })
  }

  // FR2 / FR3 — true when an active todo's due date is before today
  const isOverdue = (str) => {
    if (!str) return false
    return str < new Date().toISOString().slice(0, 10)
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-start justify-center py-16 px-4">

      {/*
        NFR3 — visually hidden aria-live region.
        "sr-only" keeps it out of the visual layout while staying in the
        accessibility tree. aria-live="polite" waits for the user to stop
        interacting before reading the message aloud.
      */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {liveMsg}
      </div>

      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">Todo List</h1>

        {/* ── Add-todo inputs ─────────────────────────────────────────── */}
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTodo()}
            placeholder="What needs doing?"
            aria-label="New todo text"
            className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={addTodo}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition"
          >
            Add
          </button>
        </div>

        {/* FR2 — due-date picker for new todo */}
        <div className="flex items-center gap-2 mb-4">
          <label htmlFor="new-due-date" className="text-xs text-slate-500 whitespace-nowrap">
            Due date (optional)
          </label>
          <input
            id="new-due-date"
            type="date"
            value={inputDueDate}
            onChange={(e) => setInputDueDate(e.target.value)}
            aria-label="Due date for new todo"
            className="flex-1 px-3 py-1.5 border border-slate-200 rounded-md text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* ── Filter tabs ─────────────────────────────────────────────── */}
        {/*
          NFR3 — aria-pressed tells screen readers which filter is active.
          VoiceOver/NVDA will read e.g. "All, pressed" or "Active, not pressed".
        */}
        <div role="group" aria-label="Filter todos" className="flex gap-2 mb-4">
          {['all', 'active', 'completed'].map((name) => (
            <button
              key={name}
              onClick={() => changeFilter(name)}
              aria-pressed={filter === name}
              className={tabClass(name)}
            >
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </button>
          ))}
        </div>

        {/* ── Todo list ───────────────────────────────────────────────── */}
        <ul className="space-y-2">
          {visible.map((todo) => (
            <li
              key={todo.id}
              className="flex items-start gap-3 px-3 py-2 rounded-md border border-slate-200 hover:bg-slate-50"
            >
              {/* Toggle / text */}
              <button
                onClick={() => toggleTodo(todo.id)}
                className={`flex-1 text-left ${
                  todo.done ? 'line-through text-slate-400' : 'text-slate-800'
                }`}
                aria-label={`Mark "${todo.text}" as ${todo.done ? 'active' : 'completed'}`}
              >
                {todo.text}

                {/* FR2 — due-date badge */}
                {todo.dueDate && (
                  <span
                    className={`ml-2 text-xs font-medium px-1.5 py-0.5 rounded ${
                      !todo.done && isOverdue(todo.dueDate)
                        ? 'bg-red-100 text-red-600'   // overdue & active → FR3
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {formatDate(todo.dueDate)}
                  </span>
                )}
              </button>

              {/* FR2 — inline date picker to edit/clear the due date */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <input
                  type="date"
                  value={todo.dueDate}
                  onChange={(e) => updateDueDate(todo.id, e.target.value)}
                  disabled={todo.done}
                  aria-label={`Change due date for "${todo.text}"`}
                  className="text-xs border border-slate-200 rounded px-1.5 py-0.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed"
                />
                {todo.dueDate && !todo.done && (
                  <button
                    onClick={() => updateDueDate(todo.id, '')}
                    aria-label={`Remove due date from "${todo.text}"`}
                    className="text-slate-400 hover:text-red-400 text-sm transition"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Delete */}
              <button
                onClick={() => deleteTodo(todo.id)}
                className="text-slate-400 hover:text-red-500 text-lg font-bold px-2"
                aria-label={`Delete "${todo.text}"`}
              >
                ×
              </button>
            </li>
          ))}

          {visible.length === 0 && (
            <li className="text-center text-slate-400 py-4 text-sm">
              Nothing here.
            </li>
          )}
        </ul>

        <div className="mt-4 text-sm text-slate-500">
          {remaining} {remaining === 1 ? 'item' : 'items'} left
        </div>

        {/* FR6 — Clear completed */}
        <div className="mt-3">
          <button
            type="button"
            onClick={clearCompleted}
            disabled={completedCount === 0}
            aria-disabled={completedCount === 0}
            className="w-full px-3 py-2 rounded-md text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Clear completed
          </button>
        </div>
      </div>
    </div>
  )
}