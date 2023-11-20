export interface IStar {
  get_star_ts: number;
  star_index: number;
}

export interface IDayLevel {
  1: IStar | undefined;
  2: IStar | undefined;
}

export interface ILeaderboardUser {
  id: number;
  name: string;

  global_score: number;
  local_score: number;

  last_star_ts: number;
  stars: number;

  completion_day_level: Record<number, IDayLevel>;
}

export interface ILeaderboard {
  members: Record<number, ILeaderboardUser>;
  owner_id: number;
  event: string;
}

export async function getData(
  date: Date,
  id: string,
  session: string
): Promise<ILeaderboard> {
  const year = date.getFullYear();

  const url = `https://adventofcode.com/${year}/leaderboard/private/view/${id}.json`;

  const res = await fetch(url, {
    headers: {
      cookie: `session=${session}`,
      "cache-control": "max-age=0",
    },
    referrer: `https://adventofcode.com/${year}}/leaderboard/private/view/${id}`,
    method: "GET",
  });

  const o = await res.json();
  return o as ILeaderboard;
}
