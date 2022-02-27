export async function handleTIL(postID: number): Promise<Response> {
  let post: PostInfo;
  try {
    post = await getPostInfo(postID);
    if (!post) {
      return new Response("not found", { status: 404 });
    }
  } catch (e) {
    console.error(e);
    return new Response("server error", { status: 500 });
  }

  return getImage(post);
}

type PostInfo = {
  title: string;
  authorName: string;
  profileImage: string;
};

type PostQueryData = {
  til_posts: {
    title: string;
    author: {
      display_name: string;
      profile_image: string;
    };
  }[];
};

const query = `
  query($postID: bigint) {
    til_posts(where: { id: { _eq: $postID } }, order_by: { id: desc }, limit: 1) {
      title
      author {
        display_name
        profile_image
      }
    }
  }
`;

async function getPostInfo(postID: number): Promise<PostInfo> {
  const url = "https://engaging-mustang-19.hasura.app/v1/graphql";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      query,
      variables: { postID },
    }),
  });
  if (res.status !== 200) {
    throw Error("failed to fetch post info");
  }

  const { data } = await res.json<{ data: PostQueryData }>();
  if (!data || data.til_posts.length === 0) {
    return null;
  }

  const post = data.til_posts[0];
  return {
    title: post.title,
    authorName: post.author.display_name,
    profileImage: post.author.profile_image,
  };
}

async function getImage({ title, authorName, profileImage }: PostInfo): Promise<Response> {
  const url = "https://ogen.lynlab.co.kr/generate.png";
  const query = new URLSearchParams({
    title,
    author: authorName,
    profile_image: profileImage,
  });

  return await fetch(`${url}?${query.toString()}`);
}
