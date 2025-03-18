import type { ResultSet } from "@libsql/client";

export type HNItem = {
	id: number;
	descendants?: number;
	by: string;
	kids?: number[];
	score: number;
	text?: string;
	time: number;
	title: string;
	type: "job" | "story" | "comment" | "poll" | "pollopt";
	url?: string;
};

export type HNAPIResponse = {
	author: string;
	children: HNAPIResponse[];
	created_at: string;
	created_at_i: number;
	id: number;
	options: number[];
	parent_id: number | null;
	points: number;
	story_id: number;
	text: string | null;
	title: string | null;
	type: "story" | "comment" | "poll" | "pollopt" | "job";
	url: string;
};

export type MyResultSet<T> = ResultSet & { rows: T[] };

export interface NotificationResponse {
	id: number;
	newComments: number;
	url: string;
	notification: boolean;
}
