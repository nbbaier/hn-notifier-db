import type { Context } from "hono";

export const handleError = (c: Context, error: unknown) => {
	if (error instanceof Error) {
		return c.json({ error: error.message }, 500);
	}
	return c.json({ error: "Unknown error occurred" }, 500);
};
