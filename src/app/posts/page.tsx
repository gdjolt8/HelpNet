"use client";
import { useEffect, useState, Suspense } from "react";
import { Post, Reply } from "@/models/Post";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { User } from "@/models/User";
import { getToken } from "@/lib/functions";
import Cookies from "js-cookie";
import { ChartBarIcon, HeartIcon, PhotoIcon } from "@heroicons/react/24/outline";
import Navbar from "@/components/Navbar";
import { PublicUserInfo } from "../api/getUserInfo/route";
import Loading from "@/components/Loading";
import { supabase } from "@/lib/supabaseClient";
import FollowButton from "@/components/FollowButton";
import VideoPlayer from "@/components/VideoPlayer";
import Link from "next/link";

const PostPage = () => {
  const searchParams = useSearchParams();
  const postId = searchParams?.get("id");
  const [newReply, setNewReply] = useState<string>("");
  const [post, setPost] = useState<Post | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [author, setAuthor] = useState<PublicUserInfo | null>(null);
  const [load, setLoad] = useState(true);
  const [rLoad, setrLoad] = useState(false);
  const [fLoad, setfLoad] = useState(false);
  const router = useRouter();
  const [likes, setLikes] = useState<number>(0);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [isAllLoaded, setIsAllLoaded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState("");

  useEffect(() => {
    if (!postId) notFound();
    const fetchPostData = async () => {
      if (!isAllLoaded) {
      try {
        const postResponse = await fetch("/api/getPost", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId }),
        });
        const postData = await postResponse.json();
        if (!postData.ok) {
          router.replace("/404");
          return;
        }
        setPost(postData.post);
        setLikes(postData.post.likes?.length || 0);
        setReplies(postData.post.replies || []);
        setContent(post?.content || "No Content");

          const userResponse = await getToken(String(Cookies.get("authorization")));
          if (!userResponse.ok) {
            router.replace("/login");
            return;
          }
          setUser(userResponse.account);

          const authorRes = await fetch("/api/getUserInfo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: postData.post.author }),
          });
          const authorData = await authorRes.json();
          setAuthor(authorData.user);
        
        if (user && author) {
          
          const followCheckRes = await fetch("/api/isFollowing", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ follower: userResponse.account.username, following: authorData.user.username }),
          });
          const followCheckData = await followCheckRes.json();
          setIsFollowing(followCheckData.isFollowing);
          setIsAllLoaded(true);
        }
        

        setLoad(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    };

    fetchPostData();
  }, [postId, router, user, author, isFollowing, isAllLoaded]);

  useEffect(() => {
    const view = async () => {
      await fetch("/api/viewPost", {
        method: "POST",
        body: JSON.stringify({ postId: String(postId) }),
        headers: { "Content-Type": "application/json" },
      });
    };
    view();
  }, [postId, router]);
  const handleLike = async () => {
    try {
      const response = await fetch("/api/likePost", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId: post?._id, author: user?.username }),
      });
      const res = await response.json();
      if (res.ok) {
        setLikes(res.likes.length);
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const followUser = async () => {
    try {
      setfLoad(true);
      const response = await fetch("/api/followUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: author?._id }),
      });
      const res = await response.json();
      if (res.ok) {
        setIsFollowing(!isFollowing);
      }
      setfLoad(false);
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };
  const editPost = async () => {
    try {
      await fetch("/api/editPost", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ authorization: String(Cookies.get("authorization")), new_post: content }),
      });
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleReply = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newReply.trim()) return;
    const formData = new FormData(event.currentTarget);
    const imageUrls: string[] = [];
    try {

      const images = formData.getAll("images")
      .filter((file): file is File => file instanceof File && file.name != '' && file.size > 0);
      console.log("img len: " + images.length, formData);
      for (const image of images) {
        const fileName = `images/${Date.now()}-${image.name}`;
        const { data, error } = await supabase.storage.from("images").upload(fileName, image);

        if (error) {
          console.error("Error uploading image:", error.message);
          continue;
        }

        const { publicUrl } = supabase.storage.from("images").getPublicUrl(data.path).data;
        imageUrls.push(publicUrl);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      return;
    }

    try {
      setrLoad(true);
      const response = await fetch("/api/replyToPost", {
        method: "POST",
        body: JSON.stringify({
          postId: postId,
          authorization: String(Cookies.get("authorization")),
          message: formData.get("message")?.toString(),
          images: imageUrls,
        }),
      });
      if (response.ok) {
        const updatedPost = await response.json();
        setReplies(updatedPost?.replies || []);
        setNewReply("");
      }
      setrLoad(false);
    } catch (error) {
      setrLoad(false);
      console.error("Error posting reply:", error);
    }
  };

  if (load) return <div>Loading...</div>;

  const renderContentWithBreaks = (content: string) =>
    content.split("\n").map((line, index) => (line != '' ? <p key={index}>{line}</p> : <br key={index} />));
  return (
    <>
      <Navbar type={2} />
      <div className="p-9 w-[99.9%] min-h-screen mx-auto bg-white rounded-lg shadow-lg space-y-6 font-sans text-black">
        {/* User Profile Card */}
        {/* Follow-Only Content */}
        {!isFollowing && user?.username != author?.username && post?.follower_only ? (
          <><div className="flex flex-row items-center justify-between gap-4">
            <div>
              <img
                src={author?.profile_picture_url || "/default-avatar.png"}
                alt={`${post?.author}'s profile`}
                className="w-24 h-24 rounded-full object-cover"
              />
              <div>
                <span className="font-semibold text-lg">
                  {post?.author} {author?.admin && <span className="text-blue-500">🛡️</span>}
                </span>
                <span className="text-gray-500">@{post?.author}</span>
              </div>
            </div>

            {user?.username != author?.username && <FollowButton followUser={followUser} isFollowing={isFollowing} loading={fLoad} />}
          </div>
            <span className="text-sm text-gray-500">
              Created at {post?.creationDate ? new Date(post.creationDate).toLocaleString() : "N/A"}
            </span>
            <h1 className="text-2xl font-semibold mt-4">{post?.title || "No Title"}</h1>
            <span className="text-gray-700 mt-2">{renderContentWithBreaks(post?.content.slice(0, 10) + "..." || "No Content")}</span>
            <div className="flex justify-center items-center h-64 text-xl font-bold text-gray-500">
              {"FOLLOWER-ONLY CONTENT: You must follow this user to access this post."}
            </div>
          </>
        ) : (
          <>
            {/* Post Author */}
            <div className="flex items-center justify-between gap-4">
              <Link href={`/profile?user=${post?.author}`} className="flex flex-row gap-x-[1.2rem]">
                <img
                  src={author?.profile_picture_url || "/default-avatar.png"}
                  alt={`${post?.author}'s profile`}
                  className="w-20 h-20 rounded-full object-cover hover:opacity-90 mt-[4%]"
                />
                <div className="mt-[10%]">
                  <div className="flex flex-row gap-x-1.5 h-8">
                  <p className="font-semibold text-2xl hover:underline">
                    {post?.author}
                  </p>
                  {author?.admin && <span className="text-blue-500 mb-[5%] text-2xl">🛡️</span>}
                  </div>
                  <p className="text-gray-500 text-xl">@{post?.author}</p>
                </div>
              </Link>
              <div className="flex flex-row gap-x-2">
                {user?.username == author?.username && <button onClick={() => setEditing(!editing)}className="bg-green-600 hover:bg-green-400 px-4 py-2 rounded-md text-white font-bold">{editing ? "Unedit" : "Edit"}</button>}
                {user?.username != author?.username && <FollowButton followUser={followUser} isFollowing={isFollowing} loading={fLoad} />}
              </div>
            </div>

            {/* Post Content */}
            <p className="text-md text-gray-500">
              Created at {post?.creationDate ? new Date(post.creationDate).toLocaleString() : "N/A"}
            </p>
            <h1 className="text-2xl font-semibold mt-2 mb-3">{post?.title || "No Title"}</h1>
            {!editing && <div className="text-gray-700 mt-2">{renderContentWithBreaks(post?.content || "No Content")}</div>}
            {editing && <textarea onBlur={editPost} className="text-gray-700 mt-2 w-full h-32 outline-0 border-1 rounded-md p-2" value={content} onChange={(e) => setContent(e.target.value)} />}
            
            {/* Post Images */}
            {(() => {
              const imgsLength = post?.images.filter(
                (image) => image.endsWith(".png") || image.endsWith(".jpg") || image.endsWith(".webp") || image.endsWith(".gif")
              ).length;
              const vidsLength = post?.images.filter(
                (image) => image.endsWith(".mp4") || image.endsWith(".quicktime")
              ).length;

              return (
                post?.images && post.images.length > 0 && (
                  <div
                    className={`grid mt-4 ${post.images.length === 1
                      ? "grid-cols-1"
                      : "grid-cols-2 gap-2"
                      }`}
                  >
                    {post.images.map((media, index) =>
                      media.endsWith(".mp4") ? (
                        <VideoPlayer
                          videoUrl={media}
                          key={index}
                          className={`rounded-lg object-cover ${vidsLength === 1 ? "w-full h-auto aspect-video" : "h-[250px] w-full aspect-video"}`}
                        />
                      ) : (
                        <img
                          key={index}
                          src={media}
                          alt={`Post attachment ${index + 1}`}
                          className={`rounded-lg object-cover ${imgsLength === 1 ? "w-full h-auto" : "h-[250px] w-full"
                            }`}
                        />
                      )
                    )}
                  </div>
                )
              );
            })()}


            {post?.links && post?.links.length > 0 && (
              <div className="mt-4">
                {post.links.map((link, index) => (
                  <Link
                    key={index}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline block mt-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {link}
                  </Link>
                ))}
              </div>
            )}
            {/* Like and Views */}
            <div className="flex justify-between items-center mt-4">
              <button
                className="flex items-center gap-2 text-gray-500 hover:text-red-500"
                onClick={handleLike}
              >
                <HeartIcon className="w-6 h-6" />
                <span>{likes} {(likes == 1 ? "like" : "likes")}</span>
              </button>
              <div className="flex items-center gap-2 text-gray-500">
                <ChartBarIcon className="w-6 h-6" />
                <span>{post?.views} views</span>
              </div>
            </div>

            {/* Reply Form */}
            <form onSubmit={handleReply}>
              <div className="mt-6">
                <textarea
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  placeholder="Write a reply..."
                  rows={3}
                  className="w-full border rounded-lg p-3"
                  name="message"
                />
                <div className="relative">
                  <PhotoIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="file"
                    name="images"
                    tabIndex={-1}
                    accept="image/jpeg, image/png, image/webp, image/gif, video/mp4, video/quicktime"
                    multiple={true}
                    className="block w-full px-10 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                </div>
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                  >
                    {rLoad ? <Loading /> : "Reply"}
                  </button>
                </div>
              </div>

              {/* Replies */}
              <div className="space-y-4">
                <h2 className="font-semibold text-lg">Replies</h2>
                {replies.map((reply, index) => (
                  <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg shadow-md">
                    <img
                      src={reply.author.profile_picture_url || "/default-avatar.png"}
                      alt={`${reply.author.username}'s profile`}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <Link href={`/profile?user=${reply.author.username}`}>
                      <p className="font-semibold hover:underline h-5">
                        {reply.author.username} {reply.author.admin && <span className="text-blue-500">🛡️</span>}
                      </p>
                      <p className="mb-0.5 text-sm text-gray-400">
                        @{reply.author.username}
                      </p>
                      </Link>
                      <p className="text-sm text-gray-500">
                        {new Date(reply.creationDate || Date.now()).toLocaleString()}
                      </p>
                      <div className="text-gray-700 text-lg my-2">{renderContentWithBreaks(reply.content)}</div>
                      {(() => {
                        const imgsLength = post?.images.filter(
                          (image) => image.endsWith(".png") || image.endsWith(".jpg") || image.endsWith(".webp") || image.endsWith(".gif")
                        ).length;
                        const vidsLength = post?.images.filter(
                          (image) => image.endsWith(".mp4") || image.endsWith(".quicktime")
                        ).length;

                        return (
                          reply?.images && reply.images.length > 0 && (
                            <div
                              className={`grid mt-4 ${reply.images.length === 1
                                ? "grid-cols-1"
                                : "grid-cols-2 gap-2"
                                }`}
                            >
                              {reply.images.map((media, index) =>
                                media.endsWith(".mp4") ? (
                                  <VideoPlayer
                                    videoUrl={media}
                                    key={index}
                                    className={`rounded-lg object-cover ${vidsLength === 1 ? "w-full h-auto aspect-video" : "h-[250px] w-full aspect-video"}`}
                                  />
                                ) : (
                                  <img
                                    key={index}
                                    src={media}
                                    alt={`Reply attachment ${index + 1}`}
                                    className={`rounded-lg object-cover ${imgsLength === 1 ? "w-full h-auto" : "h-[250px] w-full"
                                      }`}
                                  />
                                )
                              )}
                            </div>
                          )
                        );
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            </form>
          </>
        )}
      </div>
    </>
  )
};

const Page = () => {
  return (
    <Suspense>
      <PostPage />
    </Suspense>
  )
};

export default Page;
