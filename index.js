require('dotenv').config();

const { WebhookClient, MessageEmbed } = require('discord.js');
const { CronJob } = require('cron');
const axios = require('axios').default;
const tableC = require('text-table');

const webhookId = process.env.WEBHOOK_ID;
const webhookToken = process.env.WEBHOOK_TOKEN;
const leaderboardUrl = process.env.LEADERBOARD_URL;
const sessionId = process.env.SESSION_ID;

const webhookClient = new WebhookClient(webhookId, webhookToken);


const sendLeaderboard = async () => {
    const members = Object.entries(await fetchData()).map(o => o[1]).filter((o) => o.stars > 0).sort((a, b) => b.local_score - a.local_score);

    const table = tableC([
        ['Score', 'Name', 'Stars ⭐'],
        ...members.map(member => ([
            member.local_score,
            member.name,
            member.stars,
        ]))
    ]);

    const embed = new MessageEmbed()
        .setAuthor(
            'Advent Of Code',
            'https://adventofcode.com/favicon.png',
            'https://adventofcode.com/2021/leaderboard/private/view/1012476'
        )
        .setColor('#FFAC33')
        .setDescription('```\n' + table + '\n```');

    webhookClient.send({ embeds: [embed] });
}


const fetchData = async () => {
    try {
        const { data } = await axios.get(leaderboardUrl, {
            headers: { Cookie: `session=${sessionId};` }
        });
        if (!data.members) throw new Error('Something went wrong!?!');

        return data.members;
    } catch (err) {
        throw err;
    }
}


const job = new CronJob('0 0 22 * * *', () => sendLeaderboard(), null, true, 'Europe/Ljubljana');

if (process.argv.includes('--send', 2)) sendLeaderboard();

