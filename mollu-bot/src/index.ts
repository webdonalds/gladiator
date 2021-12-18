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
  const lastTweetIdKey = "LAST_TWEET_ID";
  const lastTweetId = await MOLLUBOT_KV.get(lastTweetIdKey);
  const tweetUrl = `https://api.twitter.com/2/users/1419529986420051968/tweets?since_id=${lastTweetId}`;
  const response = await fetch(tweetUrl, {
    headers: {
      Authorization: `Bearer ${TWITTER_BEARER_TOKEN}`,
    },
  });

  const tweets = await response.json<{ data: Tweet[] }>();
  if (!tweets.data || tweets.data.length === 0) {
    return new Response("ok");
  }

  await fetch(DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      content: tweets.data[0].text,
    }),
  });

  await MOLLUBOT_KV.put(lastTweetIdKey, tweets.data[0].id);
  return new Response("ok");
}
