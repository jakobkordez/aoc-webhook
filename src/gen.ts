import puppeteer from "puppeteer";
import { ILeaderboard, ILeaderboardUser } from "./api";
import { readFileSync } from "fs";

const medals = ["", "🥇", "🥈", "🥉"];

const template = readFileSync("template.html").toString();

function getStarTime(user: ILeaderboardUser, dayStart: Date, star: 1 | 2) {
  const day = dayStart.getUTCDate();
  const starTs = user.completion_day_level[day]?.[star]?.get_star_ts;
  if (!starTs) return "";
  const diff = starTs - dayStart.valueOf() / 1000;
  const hours = Math.floor(diff / 3600);
  if (hours > 24) return "> 24h";
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = Math.floor(diff % 60);
  return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(seconds, 2)}`;
}

function mapRow(...args: any[]) {
  return `<tr class="p${parseInt(args[0])}"><td>${args.join(
    "</td><td>"
  )}</td></tr>`;
}

function pad(n: number, digits: number): string {
  return n.toString().padStart(digits, "0");
}

function buildHTML(date: Date, leaderboard: ILeaderboard) {
  const day = date.getUTCDate();
  const startDate = new Date(date);
  startDate.setUTCHours(5, 0, 0, 0);

  if (day > 25) return `<h1>Nekdo je pozabil ugasniti webhook</h1>`;

  let t = template.replace("<!--day-->", pad(day, 2));

  const people = Object.values(leaderboard.members)
    .filter((a) => a.local_score > 0)
    .sort((a, b) => b.local_score - a.local_score);

  if (people.length === 0) return `<h1>Leaderboard empty</h1>`;

  const solvedToday = people.filter((a) => a.completion_day_level[day]);
  // 1st, 2nd, 3rd places for 1st star
  const firstStarMedals = solvedToday
    .sort(
      (a, b) =>
        a.completion_day_level[day][1]!.get_star_ts -
        b.completion_day_level[day][1]!.get_star_ts
    )
    .slice(0, 3)
    .map((a) => a.id);
  // 1st, 2nd, 3rd places for 2nd star
  const secondStarMedals = solvedToday
    .filter((a) => a.completion_day_level[day][2])
    .sort(
      (a, b) =>
        a.completion_day_level[day][2]!.get_star_ts -
        b.completion_day_level[day][2]!.get_star_ts
    )
    .slice(0, 3)
    .map((a) => a.id);

  // Display only who solved today or top 5
  const filteredPeople = people.filter(
    (u, i) => i < 5 || u.completion_day_level[day]
  );
  const digits = (filteredPeople.length - 1).toString().length;

  const scores = people.map((u) => u.local_score);

  const usersHtml = filteredPeople
    .map((u) =>
      mapRow(
        pad(scores.indexOf(u.local_score), digits),
        u.name,
        getStarTime(u, startDate, 1),
        medals[firstStarMedals.indexOf(u.id) + 1],
        getStarTime(u, startDate, 2),
        medals[secondStarMedals.indexOf(u.id) + 1],
        u.local_score
      )
    )
    .join("");

  return t.replace("<!--players-->", usersHtml);
}

export async function buildImage(date: Date, leaderboard: ILeaderboard) {
  const content = buildHTML(date, leaderboard);

  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--disable-setuid-sandbox",
      "--no-sandbox",
    ],
  });
  const page = await browser.newPage();
  await page.setContent(content);

  await page.waitForNetworkIdle({ idleTime: 100, timeout: 100_000 });

  await page.waitForSelector("body");
  const body = await page.$("body");
  if (!body) throw new Error("No body");

  const buffer = await body.screenshot({
    captureBeyondViewport: true,
    type: "png",
  });
  browser.close();

  return buffer;
}
