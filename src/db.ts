import { createClient } from "@libsql/client";
import type { HNItem, MyResultSet } from "./types";

export const db = createClient({
	url: "file:data.db",
});

export async function initDB(reinit = false) {
	if (reinit) {
		await db.execute("drop table if exists hn_following");
	}

	await db.execute(`CREATE TABLE IF NOT EXISTS hn_following (
    id INTEGER PRIMARY KEY,
    comments NUMBER DEFAULT 0,
    type TEXT,
    url STRING
  )`);
}

export async function updateCommentCount(id: number, comments: number) {
	await db.execute({
		sql: "UPDATE hn_following SET comments = ? WHERE id = ?",
		args: [comments, id],
	});
}

export async function getFollowedItem(id: number) {
	const { rows } = (await db.execute({
		sql: "select * from hn_following where id = ?",
		args: [id],
	})) as MyResultSet<{
		id: number;
		comments: number;
		type: string;
		url: string;
	}>;
	return rows[0];
}

export async function followItem(item: HNItem) {
	const { id, type, kids } = item;
	const url = `https://news.ycombinator.com/item?id=${id}`;

	return await db.execute({
		sql: "INSERT INTO hn_following (id, type, comments, url) VALUES (:id, :type, :comments, :url) RETURNING *",
		args: { id, comments: kids?.length || 0, type, url },
	});
}

export async function unfollowItem(id: number) {
	await db.execute({
		sql: "DELETE FROM hn_following WHERE id = ?",
		args: [id],
	});
}

export async function listFollowedItems() {
	const { rows } = await db.execute("select id from hn_following");
	return rows.map((row) => row.id);
}

export async function getAllFollowedItems() {
	return (await db.execute("select * from hn_following")) as MyResultSet<{
		id: number;
		comments: number;
		type: string;
		url: string;
	}>;
}
