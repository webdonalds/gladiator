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

  const resBody = await response.json<{ data: Tweet[] }>();
  if (!resBody.data || resBody.data.length === 0) {
    return new Response("ok");
  }

  const tweets = resBody.data.sort((a, b) => a.id - b.id);
  await fetch(DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      content: tweets.map((t) => t.text).join("\n\n"),
    }),
  });

  await MOLLUBOT_KV.put(lastTweetIdKey, tweets[tweets.length - 1].id);
  return new Response("ok");
}
