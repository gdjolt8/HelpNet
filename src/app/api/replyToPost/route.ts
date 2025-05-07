import Posts from "@/models/Post";

export async function POST(req: Request) {
  try {
    const {postId, author, message, images} = await req.json();
    if (!postId || !author || !message) {
      return new Response(JSON.stringify({ message: "Missing required fields" }), { status: 400 });
    }

    // Fetch the post from the database
    const post = await Posts.findById(postId);
    if (!post) {
      return new Response(JSON.stringify({ message: "Post not found" }), { status: 404 });
    }

    // Fetch user data for the reply author
    const userRes = await fetch("https://help-net-liart.vercel.app/api/getUserInfo", {
      method: "POST",
      body: JSON.stringify({ username: author }),
    });
    const user = await userRes.json();

    // Update the post with the new reply
    await Posts.findByIdAndUpdate(postId, {
      $push: {
        replies: {
          creationDate: new Date(),
          author: user,
          content: message,
          likes: 0,
          views: 0,
          images: (!images ? [] : images),
          links: [],
        },
      },
    });

    // Fetch the updated post with the new reply
    const updatedPost = await Posts.findById(postId);
    return new Response(JSON.stringify(updatedPost), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Error posting reply" }), { status: 500 });
  }
}
