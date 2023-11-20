require("dotenv").config();

import { WebhookClient } from "discord.js";
import { buildImage } from "./gen";
import { getData } from "./api";
import { CronJob } from "cron";

const webhookURL = process.env.WEBHOOK_URL ?? "";
const leaderboardID = process.env.LEADERBOARD_ID ?? "";
const sessionId = process.env.SESSION_ID ?? "";

if (!webhookURL || !leaderboardID || !sessionId) {
  console.log("Missing env variables");
  process.exit(1);
}

async function main() {
  const date = new Date();

  const r = await getData(date, leaderboardID, sessionId);

  const buffer = await buildImage(date, r);

  const webhook = new WebhookClient({ url: webhookURL });

  await webhook.send({
    files: [{ attachment: buffer }],
  });
}

const _ = new CronJob(
  "0 0 22 1-25 12 *",
  () => main(),
  null,
  true,
  "Europe/Ljubljana",
  null,
  process.argv.includes("--now", 2)
);
