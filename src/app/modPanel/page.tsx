"use client";

import { useEffect, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { User } from "@/models/User";
import { Post } from "@/models/Post";
import Cookies from "js-cookie";

const ModPanel = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState<string | null>(null);
  const [banReasons, setBanReasons] = useState<Record<string, string>>({}); // Store ban reasons per user
  const [deleteReasons, setDeleteReasons] = useState<Record<string, string>>({}); // Store delete reasons per post
  const router = useRouter();

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const res = await fetch("/api/verifyAdmin", {
          method: "POST",
          body: JSON.stringify({ token: Cookies.get("authorization") }),
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        if (!res.ok || !data.isAdmin) {
          notFound();
        }

        const [postRes, userRes] = await Promise.all([fetch("/api/posts"), fetch("/api/getAllUsers")]);

        const postData = await postRes.json();
        const userData = await userRes.json();

        setPosts(postData);
        setUsers(userData);
        setLoading(false);
      } catch (error) {
        console.error("Error verifying admin or fetching data:", error);
        router.replace("/404");
      }
    };

    checkAdminAccess();
  }, [router]);

  const togglePostDeletion = async (postId: string, deleted: boolean) => {
    const reason = deleteReasons[postId];
    if (deleted && !reason.trim()) {
      alert("Please provide a reason for deleting the post.");
      return;
    }

    setButtonLoading(postId);
    const response = await fetch("/api/deletePost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, deleted, reason }),
    });

    const res = await response.json();

    if (response.ok) {
      setPosts(res.posts);
      if (deleted) setDeleteReasons((prev) => ({ ...prev, [postId]: "" })); // Reset the reason after deleting
    }
    setButtonLoading(null);
  };

  const toggleUserBan = async (userId: string, banned: boolean) => {
    const reason = banReasons[userId];
    if (banned && !reason.trim()) {
      alert("Please provide a reason for banning the user.");
      return;
    }

    setButtonLoading(userId);
    const response = await fetch("/api/banUser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, reason }),
    });

    if (response.ok) {
      setUsers(users.map((user) => (user._id === userId ? { ...user, banned } : user)));
      if (banned) setBanReasons((prev) => ({ ...prev, [userId]: "" })); // Reset the reason after banning
    }
    setButtonLoading(null);
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-purple-600 to-indigo-500 text-white rounded-lg shadow-xl">
      <h1 className="text-4xl font-extrabold mb-6">✨ Moderation Panel</h1>

      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-4">📝 Manage Posts</h2>
        <div className="space-y-6">
          {posts.map((post) => (
            <div
              key={post._id}
              className="flex justify-between items-center bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition-all text-gray-800"
            >
              <div>
                <h3 className="font-bold text-xl">{post.title}</h3>
                <p className="text-gray-600 text-sm mt-2">{post.content.slice(0, 120)}...</p>
                <p className="text-gray-500 text-sm font-light">{post.deleted ? "Deleted" : "Active"}</p>
              </div>
              <div className="flex items-center gap-4">
                {post.deleted ? (
                  <button
                    onClick={() => togglePostDeletion(post._id, !post.deleted)}
                    disabled={buttonLoading === post._id}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                      buttonLoading === post._id ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 text-white"
                    }`}
                  >
                    {buttonLoading === post._id ? "Processing..." : "Undelete"}
                  </button>
                ) : (
                  <>
                    <input
                      type="text"
                      placeholder="Delete Reason"
                      value={deleteReasons[post._id] || ""}
                      onChange={(e) => setDeleteReasons((prev) => ({ ...prev, [post._id]: e.target.value }))}
                      className="flex-1 p-2 border rounded-lg"
                    />
                    <button
                      onClick={() => togglePostDeletion(post._id, !post.deleted)}
                      disabled={buttonLoading === post._id}
                      className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                        buttonLoading === post._id ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 text-white"
                      }`}
                    >
                      {buttonLoading === post._id ? "Processing..." : "Delete"}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold mb-4">👤 Manage Users</h2>
        <div className="space-y-6">
          {users.map((user) => (
            <div
              key={user._id}
              className="flex flex-col gap-4 bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition-all text-gray-800"
            >
              <div>
                <h3 className="font-bold text-xl">{user.username}</h3>
                <p className="text-gray-600 text-sm mt-2">
                  {user.email} {user.banned && <span className="text-red-500">(Banned)</span>}
                </p>
              </div>
              {!user.banned ? (
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    placeholder="Ban Reason"
                    value={banReasons[user._id] || ""}
                    onChange={(e) => setBanReasons((prev) => ({ ...prev, [user._id]: e.target.value }))}
                    className="flex-1 p-2 border rounded-lg"
                  />
                  <button
                    onClick={() => toggleUserBan(user._id, true)}
                    disabled={buttonLoading === user._id}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                      buttonLoading === user._id ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 text-white"
                    }`}
                  >
                    {buttonLoading === user._id ? "Banning..." : "Ban"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => toggleUserBan(user._id, false)}
                  disabled={buttonLoading === user._id}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    buttonLoading === user._id ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                >
                  {buttonLoading === user._id ? "Processing..." : "Unban"}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ModPanel;
