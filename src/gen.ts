import puppeteer from "puppeteer";
import { ILeaderboard } from "./api";
import { readFileSync } from "fs";

const medals = ["", "🥇", "🥈", "🥉"];

const template = readFileSync("template.html").toString();

function timestampToLocalTime(ts?: number) {
  if (!ts) return "";
  const time = new Date(ts * 1000);

  const locale = process.env.LOCALE ?? "sl-SI";
  return time.toLocaleTimeString(locale, {
    timeZone: process.env.TZ ?? "Europe/Ljubljana",
    hour: "numeric",
    minute: "2-digit",
  });
}

function mapRow(...args: any[]) {
  return `<tr><td>${args.join("</td><td>")}</td></tr>`;
}

function pad(n: number, digits: number): string {
  return n.toString().padStart(digits, "0");
}

function buildHTML(date: Date, leaderboard: ILeaderboard) {
  const day = date.getUTCDate();

  if (day > 25) return `<h1>Nekdo je pozabil ugasniti webhook</h1>`;

  let t = template.replace("<!--day-->", pad(day, 2));

  const people = Object.values(leaderboard.members)
    .filter((a) => a.local_score > 0)
    .sort((a, b) => b.local_score - a.local_score);

  const digits = (people.length - 1).toString().length;

  const solvedToday = people.filter((a) => a.completion_day_level[day]);
  const sortedByFirst = solvedToday
    .sort(
      (a, b) =>
        a.completion_day_level[day][1]!.get_star_ts -
        b.completion_day_level[day][1]!.get_star_ts
    )
    .slice(0, 3)
    .map((a) => a.id);
  const sortedBySecond = solvedToday
    .filter((a) => a.completion_day_level[day][2])
    .sort(
      (a, b) =>
        a.completion_day_level[day][2]!.get_star_ts -
        b.completion_day_level[day][2]!.get_star_ts
    )
    .slice(0, 3)
    .map((a) => a.id);

  const usersHtml = people
    .map((u, i) => {
      const firstMedal = medals[sortedByFirst.indexOf(u.id) + 1];
      const secondMedal = medals[sortedBySecond.indexOf(u.id) + 1];
      const firstStar = timestampToLocalTime(
        u.completion_day_level[day]?.[1]?.get_star_ts
      );
      const secondStar = timestampToLocalTime(
        u.completion_day_level[day]?.[2]?.get_star_ts
      );

      return mapRow(
        pad(i, digits),
        u.name,
        firstMedal,
        firstStar,
        secondMedal,
        secondStar,
        u.local_score
      );
    })
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
