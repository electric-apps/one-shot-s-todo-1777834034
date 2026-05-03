import { createFileRoute } from "@tanstack/react-router"
import { proxyElectricRequest } from "../../lib/electric-proxy"
import { db } from "../../db/index"
import { todos } from "../../db/schema"
import { todoInsertSchema } from "../../db/zod-schemas"
import { sql } from "drizzle-orm"
import { parseDates } from "../../db/utils"

const handleGet = ({ request }: { request: Request }) =>
	proxyElectricRequest(request, "todos")

const handlePost = async ({ request }: { request: Request }) => {
	const body = parseDates(await request.json())
	const parsed = todoInsertSchema.safeParse(body)
	if (!parsed.success) {
		return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		})
	}

	const result = await db.transaction(async (tx) => {
		const [row] = await tx.insert(todos).values(parsed.data).returning()
		const [{ txid }] = await tx.execute<{ txid: string }>(
			sql`SELECT pg_current_xact_id()::xid::text AS txid`,
		)
		return { id: row.id, txid: parseInt(txid, 10) }
	})

	return new Response(JSON.stringify(result), {
		status: 201,
		headers: { "Content-Type": "application/json" },
	})
}

export const Route = createFileRoute("/api/todos")({
	server: {
		handlers: {
			GET: handleGet,
			POST: handlePost,
		},
	},
})
