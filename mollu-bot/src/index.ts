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

async function handleRequest(request) {
  await handle();
}

async function handleSchedule(time) {
  await handle();
}

async function handle() {
  const lastTweetIdKey = "LAST_TWEET_ID";
  const lastTweetId = await MOLLUBOT_KV.get(lastTweetIdKey);
  const tweetUrl = `https://api.twitter.com/2/users/1419529986420051968/tweets?since_id=${lastTweetId}`;
  const response = await fetch(tweetUrl, {
    headers: {
      Authorization: `Bearer ${TWITTER_BEARER_TOKEN}`,
    },
  });

  const tweets = await response.json();
  if (!tweets.data || tweets.data.length === 0) {
    return new Response("ok");
  }

  const webhookUrl = "https://discord.com/api/webhooks/910059241442779147/SE_sh7Xlsxm03yHfrt4iQNiuwo_xYt91DZdRSxWH8av_5Bz5z_k7548Vi0flJzKcBtXy";
  await fetch(webhookUrl, {
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
