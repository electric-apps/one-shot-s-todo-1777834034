import { createFileRoute } from "@tanstack/react-router"
import { db } from "../../db/index"
import { todos } from "../../db/schema"
import { todoSelectSchema } from "../../db/zod-schemas"
import { eq, sql } from "drizzle-orm"
import { parseDates } from "../../db/utils"

const handlePut = async ({ request, params }: { request: Request; params: { id: string } }) => {
	const body = parseDates(await request.json())
	const partial = todoSelectSchema.partial().omit({ id: true, created_at: true }).safeParse(body)
	if (!partial.success) {
		return new Response(JSON.stringify({ error: partial.error.flatten() }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		})
	}

	const result = await db.transaction(async (tx) => {
		await tx.update(todos).set(partial.data).where(eq(todos.id, params.id))
		const [{ txid }] = await tx.execute<{ txid: string }>(
			sql`SELECT pg_current_xact_id()::xid::text AS txid`,
		)
		return { txid: parseInt(txid, 10) }
	})

	return new Response(JSON.stringify(result), {
		status: 200,
		headers: { "Content-Type": "application/json" },
	})
}

const handleDelete = async ({ params }: { request: Request; params: { id: string } }) => {
	const result = await db.transaction(async (tx) => {
		await tx.delete(todos).where(eq(todos.id, params.id))
		const [{ txid }] = await tx.execute<{ txid: string }>(
			sql`SELECT pg_current_xact_id()::xid::text AS txid`,
		)
		return { txid: parseInt(txid, 10) }
	})

	return new Response(JSON.stringify(result), {
		status: 200,
		headers: { "Content-Type": "application/json" },
	})
}

export const Route = createFileRoute("/api/todos/$id")({
	server: {
		handlers: {
			PUT: handlePut,
			DELETE: handleDelete,
		},
	},
})
