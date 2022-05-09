export {};

declare global {
  const UMAPYOI_BOT_KV: KVNamespace;

  const DISCORD_WEBHOOK_URL: string;
  const TWITTER_BEARER_TOKEN: string;

  type Tweet = {
    text: string;
    id: string;
  }
}
