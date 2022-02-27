import { handleTIL } from "./handlers/til";

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request: Request) {
  const path = new URL(request.url).pathname.split("/");
  switch (path[1]) {
    case "til":
      const postID = parseInt(path[2], 10);
      return await handleTIL(postID);
    default:
      return new Response("not found", { status: 404 });
  }
}
