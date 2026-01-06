![preview of bot](https://github.com/user-attachments/assets/b7100bd7-8388-4381-864e-9ec64da61ad1)

# ElvUI Discord Webhook

A serverless Cloudflare Worker that posts ElvUI update notifications to Discord via webhooks.

Checks for new ElvUI versions every 6 hours and posts changelogs to your Discord channel.

## Setup

### Prerequisites

- [Cloudflare account](https://dash.cloudflare.com/sign-up)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed
- A Discord server with webhook access

### 1. Create a Discord Webhook

1. Go to your Discord server settings
2. Navigate to **Integrations** > **Webhooks**
3. Click **New Webhook**
4. Choose the channel for update notifications
5. Copy the webhook URL

### 2. Configure Cloudflare

```bash
# Login to Cloudflare
wrangler login

# Create the KV namespace for storing version state
wrangler kv:namespace create ELVUI_STATE
```

Update `wrangler.toml` with your KV namespace ID and route configuration.

### 3. Set the Discord Webhook Secret

```bash
wrangler secret put DISCORD_WEBHOOK_URL
# Paste your Discord webhook URL when prompted
```

### 4. Deploy

```bash
pnpm install
pnpm run deploy
```

## Endpoints

| Route | Description |
|-------|-------------|
| `/` | Redirects to nathanielinman.com |
| `/status` | Health check endpoint |
| `/elvui` | Proxies the latest ElvUI download |
| `/check` | Manually trigger an update check |

## Development

```bash
# Run locally
pnpm run dev

# Test cron trigger locally
pnpm run test-cron
```
