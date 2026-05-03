import { createSelectSchema, createInsertSchema } from "drizzle-zod"
import type { z } from "zod/v4"
import { todos } from "./schema"

export const todoSelectSchema = createSelectSchema(todos)
export const todoInsertSchema = createInsertSchema(todos)

export type Todo = z.infer<typeof todoSelectSchema>
export type NewTodo = z.infer<typeof todoInsertSchema>
