import { betterFetch } from "@better-fetch/fetch";
import type { HNItem } from "./types";

export async function getItem(id: number) {
	return await betterFetch<HNItem>(
		`https://hacker-news.firebaseio.com/v0/item/${id}.json`,
	);
}
