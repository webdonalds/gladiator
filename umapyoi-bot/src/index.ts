addEventListener("fetch", (event) => {
  event.respondWith(
    handleRequest(event.request).catch(
      (err) => new Response(err.stack, { status: 500 })
    )
  );
});

addEventListener("scheduled", event => {
  event.waitUntil(
    handleSchedule(event.scheduledTime)
  );
})

async function handleRequest(request): Promise<Response> {
  return await handle();
}

async function handleSchedule(time) {
  await handle();
}

async function handle(): Promise<Response> {
  await fetchTweets();
  await fetchChannel();
  return new Response("ok");
}

async function fetchTweets() {
  const lastTweetIdKey = "LAST_TWEET_ID";
  const lastTweetId = await UMAPYOI_BOT_KV.get(lastTweetIdKey);
  const tweetUrl = `https://api.twitter.com/2/users/1512011570955841539/tweets?since_id=${lastTweetId}`;
  const response = await fetch(tweetUrl, {
    headers: {
      Authorization: `Bearer ${TWITTER_BEARER_TOKEN}`,
    },
  });

  const resBody = await response.json<{ data: Tweet[] }>();
  if (!resBody.data || resBody.data.length === 0) {
    return;
  }

  const tweets = resBody.data.sort((a, b) => a.id - b.id);
  await sendWebhook(tweets.map((t) => t.text).join("\n\n"));

  await UMAPYOI_BOT_KV.put(lastTweetIdKey, tweets[tweets.length - 1].id);
}

async function fetchChannel() {
  const lastCreatedAtKey = "LAST_POST_CREATED_AT";
  const lastCreatedAt = parseInt(await UMAPYOI_BOT_KV.get(lastCreatedAtKey));

  const response = await fetch(PF_CHANNEL_URL);
  const channel = await response.json<PFChannel>();
  const posts = channel.posts.items
    .filter((i) => i.created_at > lastCreatedAt)
    .sort((a, b) => a.created_at - b.created_at);
  if (posts.length === 0) {
    return;
  }

  const contents = posts.map((p) => {
    const body = p.contents.map((c) => c.v).join("\n\n");
    let postContent = `**${p.title}**\n\n${body}`;
    if (p.media && p.media.length > 0) {
      postContent += `\n${p.media[0].xlarge_url}`;
    }
    postContent += `\n\n더 보기 : ${p.permalink}`;
    return postContent;
  }).join("\n---\n");
  await sendWebhook(contents);

  await UMAPYOI_BOT_KV.put(lastCreatedAtKey, posts[posts.length - 1].created_at.toString());
}

async function sendWebhook(content: string) {
  await fetch(DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({ content }),
  });
}
