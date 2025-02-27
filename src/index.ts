import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import {
	followItem,
	getAllFollowedItems,
	getFollowedItem,
	initDB,
	listFollowedItems,
	unfollowItem,
	updateCommentCount,
} from "./db";
import type { NotificationResponse } from "./types";
import { getItem } from "./hn";
import { handleError } from "./utils";

const app = new Hono();

const schema = z.object({
	id: z
		.string()
		.regex(/^[0-9]+$/)
		.transform((v) => Number(v)),
});

app.get("/", (c) => c.text("hono!"));

app.get(
	"/init",
	zValidator(
		"query",
		z.object({
			reinit: z.coerce.boolean().optional(),
		}),
	),
	async (c) => {
		const { reinit } = c.req.valid("query");
		await initDB(reinit);
		const res = await getAllFollowedItems();
		return c.json(res);
	},
);

app.get("/follow", zValidator("query", schema), async (c) => {
	const { id } = c.req.valid("query");
	const existingItem = await getFollowedItem(id);

	if (existingItem) {
		return c.json({
			message: `Already following ${id}`,
			comments: existingItem.comments,
			url: existingItem.url,
			type: existingItem.type,
		});
	}

	const { data, error } = await getItem(id);
	if (error) return c.json(error);
	if (!data) return c.json({ error: "Unknown error occurred" }, 500);

	try {
		await followItem(data);
		return c.json({
			message: `Now following HN post ${id}`,
			comments: data.kids?.length || 0,
			url: `https://news.ycombinator.com/item?id=${id}`,
			type: data.type,
		});
	} catch (err) {
		return handleError(c, err);
	}
});

app.get("/unfollow", zValidator("query", schema), async (c) => {
	const { id } = c.req.valid("query");
	await unfollowItem(id);
	return c.json({ message: `Unfollowed HN post ${id}` });
});

app.get("/list", async (c) => {
	const items = await listFollowedItems();
	return c.json(items);
});

app.get("/check", async (c) => {
	const notifications: NotificationResponse[] = [];

	const { rows: items } = await getAllFollowedItems();

	for (const item of items) {
		const { id, comments: storedComments, url } = item;

		const { data, error } = await getItem(id);
		if (error) {
			return handleError(c, error);
		}
		const currentComments = data?.kids?.length ?? 0;
		if (storedComments < currentComments) {
			await updateCommentCount(item.id, currentComments);
			notifications.push({
				id: item.id,
				url,
				newComments: currentComments - storedComments,
				notification: true,
			});
		} else {
			notifications.push({
				id: item.id,
				newComments: 0,
				url,
				notification: false,
			});
		}
	}

	return c.json(notifications);
});

export default app;
