# Advent of Code Discord Webhook

Originally by [Martin Hanzlowsky](https://github.com/marwuint)

Updated by [Matic Babnik](https://github.com/MaticBabnik)

## Enviromental variables

Supports `.env` files.

```
WEBHOOK_URL=...
LEADERBOARD_ID=...
SESSION_ID=...
```

## Setup

### Simple

```sh
# Install dependencies
yarn

# Build
yarn build

# Start
yarn start
```

### Docker

```sh
# Build image
docker build -t aoc-webhook .

# Run
docker run -d --name aoc-webhook aoc-webhook
```
