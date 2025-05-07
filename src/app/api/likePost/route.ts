import connectToDatabase from "@/db";
import Posts from "@/models/Post";

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const { postId, author } = await req.json();

    // Validate input
    if (!postId || typeof postId !== "string") {
      return new Response(JSON.stringify({ message: "Invalid postId" }), { status: 400 });
    }
    if (!author || typeof author !== "string") {
      return new Response(JSON.stringify({ message: "Invalid author" }), { status: 400 });
    }

    // Fetch the post to ensure it exists
    const post = await Posts.findById(postId);
    if (!post) {
      return new Response(JSON.stringify({ message: "Post not found" }), { status: 404 });
    }

    // Check if the user already liked the post
    const alreadyLiked = post.likes.some((like: { username: string }) => like.username === author);

    if (alreadyLiked) {
      // Unlike the post (remove the like)
      await Posts.updateOne(
        { _id: postId },
        { $pull: { likes: { username: author } } } // Remove the user's like
      );
    } else {
      // Like the post (add the like)
      await Posts.updateOne(
        { _id: postId },
        { $push: { likes: { username: author, date: new Date() } } } // Add the user's like
      );
    }

    // Fetch the updated post to return the updated likes
    const updatedPost = await Posts.findById(postId, "likes");
    return new Response(
      JSON.stringify({ ok: true, likes: updatedPost?.likes }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in POST /like:", error);
    return new Response(
      JSON.stringify({ ok: false, message: "Error liking/unliking post" }),
      { status: 500 }
    );
  }
}
