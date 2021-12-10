# Advent of Code Discord Webhook

Originally by [Martin Hanzlowsky](https://github.com/marwuint)

## Enviromental variables

Supports `.env` files.

```
WEBHOOK_ID=...
WEBHOOK_TOKEN=...
LEADERBOARD_URL=...
SESSION_ID=...
```

## Setup

### Simple

```sh
# One time installation
npm install

# Start
npm start
```

### Docker

```sh
# Build image
docker build -t aoc-webhook .

# Run
docker run -d --name aoc-webhook aoc-webhook
```
