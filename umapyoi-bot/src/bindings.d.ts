export {};

declare global {
  const UMAPYOI_BOT_KV: KVNamespace;

  const DISCORD_WEBHOOK_URL: string;
  const PF_CHANNEL_URL: string;
  const TWITTER_BEARER_TOKEN: string;

  type Tweet = {
    text: string;
    id: string;
  };

  type PFChannel = {
    posts: {
      items: PFPostItem[];
    };
  };

  type PFPostItem = {
    title: string;
    created_at: number;
    media: PFPostItemMedia[];
    contents: PFPostItemContent[];
    permalink: string;
  };

  type PFPostItemContent = {
    t: string;
    v: string;
  };

  type PFPostItemMedia = {
    xlarge_url: string;
  };
}
