import { describe, it, expect } from "vitest"
import { todoSelectSchema, todoInsertSchema } from "@/db/zod-schemas"
import { generateValidRow, generateRowWithout } from "./helpers/schema-test-utils"

describe("todos schema", () => {
	it("valid row passes select schema", () => {
		const row = generateValidRow(todoSelectSchema)
		const result = todoSelectSchema.safeParse(row)
		expect(result.success).toBe(true)
	})

	it("row missing text fails insert schema", () => {
		const row = generateRowWithout(todoInsertSchema, "text")
		const result = todoInsertSchema.safeParse(row)
		expect(result.success).toBe(false)
	})

	it("row with completed: false is accepted by insert schema", () => {
		const row = generateValidRow(todoInsertSchema)
		const result = todoInsertSchema.safeParse({ ...row, completed: false })
		expect(result.success).toBe(true)
	})
})
