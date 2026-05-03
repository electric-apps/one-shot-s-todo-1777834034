import { createFileRoute } from "@tanstack/react-router"
import { useLiveQuery } from "@tanstack/react-db"
import { todosCollection } from "../db/collections/todos"
import { useState } from "react"
import type { Todo } from "../db/zod-schemas"

export const Route = createFileRoute("/")({ ssr: false, component: TodoApp })

function TodoApp() {
	return (
		<div className="flex min-h-svh justify-center p-6">
			<div className="flex w-full max-w-lg flex-col gap-6">
				<h1 className="text-2xl font-semibold">Todos</h1>
				<AddTodoForm />
				<TodoList />
			</div>
		</div>
	)
}

function AddTodoForm() {
	const [text, setText] = useState("")

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		const trimmed = text.trim()
		if (!trimmed) return
		todosCollection.insert({
			id: crypto.randomUUID(),
			text: trimmed,
			completed: false,
			created_at: new Date(),
		})
		setText("")
	}

	return (
		<form onSubmit={handleSubmit} className="flex gap-2">
			<input
				type="text"
				value={text}
				onChange={(e) => setText(e.target.value)}
				placeholder="Add a todo..."
				className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
			/>
			<button
				type="submit"
				className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
				disabled={!text.trim()}
			>
				Add
			</button>
		</form>
	)
}

function TodoList() {
	const { data: todos = [] } = useLiveQuery((q) =>
		q.from({ todo: todosCollection }).orderBy(({ todo }) => todo.created_at, "asc"),
	)

	if (todos.length === 0) {
		return (
			<p className="text-center text-sm text-gray-500">No todos yet — add one above!</p>
		)
	}

	return (
		<ul className="flex flex-col gap-2">
			{todos.map((todo) => (
				<TodoItem key={todo.id} todo={todo} />
			))}
		</ul>
	)
}

function TodoItem({ todo }: { todo: Todo }) {
	const handleToggle = () => {
		todosCollection.update(todo.id, (draft) => {
			draft.completed = !draft.completed
		})
	}

	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation()
		todosCollection.delete(todo.id)
	}

	return (
		<li className="flex items-center gap-3 rounded-md border border-gray-200 px-4 py-3">
			<input
				type="checkbox"
				checked={todo.completed}
				onChange={handleToggle}
				className="h-4 w-4 cursor-pointer rounded accent-blue-600"
			/>
			<span
				className={`flex-1 text-sm ${todo.completed ? "text-gray-400 line-through" : "text-gray-800"}`}
			>
				{todo.text}
			</span>
			<button
				type="button"
				onClick={handleDelete}
				className="text-gray-400 hover:text-red-500"
				aria-label="Delete todo"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<polyline points="3 6 5 6 21 6" />
					<path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
					<path d="M10 11v6M14 11v6" />
					<path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
				</svg>
			</button>
		</li>
	)
}
