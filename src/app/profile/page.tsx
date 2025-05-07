"use client";

import { useState, useEffect, Suspense } from "react";
import Cookies from "js-cookie";
import { useRouter, useSearchParams } from "next/navigation";
import { getToken } from "@/lib/functions";
import PostCard from "@/components/PostCard";
import { Post } from "@/models/Post";
import Link from "next/link";

interface User {
  _id: string;
  username: string;
  email: string;
  profile_picture_url?: string;
  bio?: string;
  followers: {username: string, id: string}[];
  following: {username: string, id: string}[];
  isFollowing?: boolean;
}


const ProfileHeader = ({
  user,
  onFollowToggle,
  buttonLoading,
}: {
  user: User;
  onFollowToggle: () => void;
  buttonLoading: boolean;
}) => (
  <div className="flex flex-col items-center bg-blue-600 text-white py-6 rounded-lg">
    <img
      src={user.profile_picture_url || "/default-avatar.png"}
      alt="Profile Picture"
      className="w-24 h-24 rounded-full object-cover border-4 border-white"
    />
    <h1 className="text-2xl font-bold mt-4">{user.username}</h1>
    <p className="text-gray-200 text-sm">{user.email}</p>
    {user.bio && <p className="text-gray-100 mt-2 text-center">{user.bio}</p>}
    <div className="mt-4 flex space-x-6">
      <p>
        <span className="font-semibold">{user.followers.length}</span> Followers
      </p>
      <p>
        <span className="font-semibold">{user.following.length}</span> Following
      </p>
    </div>
    <button
      onClick={onFollowToggle}
      disabled={buttonLoading}
      className={`mt-4 px-6 py-2 rounded-md font-semibold transition ${
        buttonLoading
          ? "bg-gray-400 cursor-not-allowed"
          : user.isFollowing
          ? "bg-red-600 hover:bg-red-700"
          : "bg-white text-blue-600 hover:bg-gray-100"
      }`}
    >
      {buttonLoading ? "Processing..." : user.isFollowing ? "Unfollow" : "Follow"}
    </button>
  </div>
);

const TabContent = ({
  activeTab,
  posts,
  followers,
  following,
}: {
  activeTab: string;
  posts: Post[];
  followers: { username: string; id: string }[]; // Updated followers and following types
  following: { username: string; id: string }[];
}) => {
  switch (activeTab) {
    case "posts":
      return (
        <div className="space-y-4">
          {posts.map((post, index) => (
            <PostCard key={index} post={post} />
          ))}
        </div>
      );
    case "followers":
      return (
        <div className="space-y-4">
          {followers.map(({ username, id }) => (
            <div
              key={id}
              className="p-4 bg-gray-100 rounded-lg shadow hover:shadow-md transition"
            >
              <Link href={`/profile/?user=${username}`}>
                <a className="text-blue-600 hover:underline">{username}</a>
              </Link>
            </div>
          ))}
        </div>
      );
    case "following":
      return (
        <div className="space-y-4">
          {following.map(({ username, id }) => (
            <div
              key={id}
              className="p-4 bg-gray-100 rounded-lg shadow hover:shadow-md transition"
            >
              <Link href={`/profile/?user=${username}`}>
                <a className="text-blue-600 hover:underline">{username}</a>
              </Link>
            </div>
          ))}
        </div>
      );
    default:
      return null;
  }
};

const ProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tweets");
  const [buttonLoading, setButtonLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchData = async () => {
      const token = Cookies.get("authorization");
      if (!token) {
        router.push("/login");
        return;
      }

      const userId = searchParams.get("user");
      if (!userId) {
        router.push("/error");
        return;
      }

      try {
        const sessionData = await getToken(token);
        const [userRes, postsRes, followingUser] = await Promise.all([
          fetch("/api/getUserInfo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: userId }),
          }),
          fetch("/api/getUserPosts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: userId }),
          }),
          fetch("/api/isFollowing", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ following: userId, follower: sessionData.account.username }),
          }),
        ]);

        const userData = await userRes.json();
        const postsData = await postsRes.json();
        const followerData = await followingUser.json();
        const userJson = userData.user;
        userJson.isFollowing = followerData.isFollowing;
        setUser(userJson);
        setPosts(postsData.posts);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching profile data:", error);
        router.push("/error");
      }
    };

    fetchData();
  }, [router, searchParams]);

  const toggleFollow = async () => {
    if (!user) return;
    try {
      setButtonLoading(true);
      const res = await fetch("/api/followUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id }),
      });

      const data = await res.json();

      if (res.ok) {
        setUser({ ...user, isFollowing: data.isFollowing });
      }
    } catch (error) {
      console.error("Error following/unfollowing user:", error);
    } finally {
      setButtonLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans">
      {user && (
        <>
          <ProfileHeader
            user={user}
            onFollowToggle={toggleFollow}
            buttonLoading={buttonLoading}
          />
          <div className="mt-6 flex justify-around border-b-2 border-gray-300">
            {["posts", "followers", "following"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 text-lg font-semibold ${
                  activeTab === tab
                    ? "border-b-4 border-blue-600 text-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <div className="mt-6">
            <TabContent
              activeTab={activeTab}
              posts={posts}
              followers={user.followers}
              following={user.following}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default function Page() {
  return (
    <Suspense>
      <ProfilePage />
    </Suspense>
  );
}
