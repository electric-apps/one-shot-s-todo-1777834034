import { createCollection } from "@tanstack/react-db"
import { electricCollectionOptions } from "@tanstack/electric-db-collection"
import { todoSelectSchema } from "../zod-schemas"
import { absoluteApiUrl } from "../../lib/client-url"

export const todosCollection = createCollection(
	electricCollectionOptions({
		id: "todos",
		schema: todoSelectSchema,
		getKey: (row) => row.id,
		shapeOptions: {
			url: absoluteApiUrl("/api/todos"),
			parser: {
				timestamptz: (date: string) => new Date(date),
			},
		},
		onInsert: async ({ transaction }) => {
			const newTodo = transaction.mutations[0].modified
			const response = await fetch("/api/todos", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(newTodo),
			})
			const result = await response.json()
			return { txid: result.txid }
		},
		onUpdate: async ({ transaction }) => {
			const updated = transaction.mutations[0].modified
			const response = await fetch(`/api/todos/${updated.id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ completed: updated.completed, text: updated.text }),
			})
			const result = await response.json()
			return { txid: result.txid }
		},
		onDelete: async ({ transaction }) => {
			const deleted = transaction.mutations[0].original
			const response = await fetch(`/api/todos/${deleted.id}`, {
				method: "DELETE",
			})
			const result = await response.json()
			return { txid: result.txid }
		},
	}),
)
