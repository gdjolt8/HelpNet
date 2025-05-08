"use client";
import { useCallback, useEffect, useState } from "react";
import { Post } from "@/models/Post";
import Link from "next/link";
import { User } from "@/models/User";
import { getToken } from "@/lib/functions";
import Cookies from "js-cookie";
import { ChartBarIcon, HeartIcon } from "@heroicons/react/24/outline";
import { Menu, Transition } from "@headlessui/react";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { Fragment } from "react";
import { PublicUserInfo } from "@/app/api/getUserInfo/route";

const Modal = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

type PostProps = {
  post: Post; // The post data passed as a prop
};

const PostCard = ({ post }: PostProps) => {
  const [likes, setLikes] = useState(post.likes);
  const [user, setUser] = useState<User | null>(null);
  const [author, setAuthor] = useState<PublicUserInfo | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [reportReason, setReportReason] = useState("");
  const renderContentWithBreaks = (content: string) => {
    return content.split("\n").map((line, index) =>
      line !== "" ? <p key={index}>{line}</p> : <br key={index} />
    );
  };

  const getUser = useCallback(async () => {
    const cookie = Cookies;
    const e = await getToken(String(cookie.get("authorization")));
    const author = await fetch("/api/getUserInfo", {
      method: "POST",
      body: JSON.stringify({username: post.author})
    });

    const acc = (await author.json()).user;
    setAuthor(acc);
    setUser(e.account);
  }, []);

  useEffect(() => {
    getUser();
  }, [getUser]);

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/likePost`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId: post._id, author: user?.username }),
      });
      const res = await response.json();
      if (res.ok) {
        setLikes(res.likes);
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/deletePost`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId: post._id, deleted: true, reason: deleteReason }),
      });
      const res = await response.json();
      if (res.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleReport = async () => {
    try {
      const response = await fetch(`/api/reportPost`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId: post._id, reporter: user?.username, message: reportReason }),
      });
      const res = await response.json();
      if (res.ok) {
        alert("Post reported successfully!");
      }
    } catch (error) {
      console.error("Error reporting post:", error);
    }
  };

  return (
    <div
      onClick={() => {
        window.location.assign(`/posts?id=${post._id}`);
      }}
      className="p-6 border rounded-lg bg-white shadow-lg hover:shadow-xl transition-shadow duration-200 ease-in-out"
    >
      <div className="flex items-center mb-4 justify-between">
        <Link href={`/profile?user=${post.author}`} onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-4">
            <img
              src={author?.profile_picture_url || "/default-avatar.png"}
              alt={`${post.author}'s profile`}
              className="w-10 h-10 rounded-full object-cover hover:opacity-90"
            />
            <div>
              <p className="font-bold text-lg hover:underline">{post.author}</p>
              <p className="text-gray-400 text-sm">@{post.author}</p>
            </div>
          </div>
        </Link>

        <Menu as="div" className="relative inline-block text-left">
          <div>
            <Menu.Button onClick={(e) => e.stopPropagation()}>
              <Cog6ToothIcon className="w-6 h-6 text-gray-500 hover:text-gray-700" />
            </Menu.Button>
          </div>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-40 bg-white divide-y divide-gray-200 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsReportModalOpen(true);
                      }}
                      className={`${
                        active ? "bg-gray-100" : ""
                      } block px-4 py-2 text-sm text-red-500 w-full text-left`}
                    >
                      Report Post
                    </button>
                  )}
                </Menu.Item>
                {user?.username === post.author || user?.admin ? (
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if(user?.admin) setIsDeleteModalOpen(true);
                          else handleDelete();
                        }}
                        className={`${
                          active ? "bg-gray-100" : ""
                        } block px-4 py-2 text-sm text-gray-700 w-full text-left`}
                      >
                        Delete Post
                      </button>
                    )}
                  </Menu.Item>
                ) : null}
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>

      <p className="text-gray-500 text-sm mb-2">
        Created at {new Date(post.creationDate).toLocaleString()}
      </p>
      <h3 className="font-semibold text-xl mb-2 text-black">{post.title}</h3>
      <p className="text-gray-700 mb-2">{post.description}</p>
      <div className="text-gray-600 mb-4">
        {post.follower_only
          ? renderContentWithBreaks(post.content.slice(0, 10) + "...")
          : renderContentWithBreaks(post.content)}
      </div>

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleLike();
          }}
          className="flex items-center text-gray-500 hover:text-red-500 transition-colors"
        >
          <HeartIcon className="w-5 h-5" />
          <p className="text-sm ml-2">{likes.length} likes</p>
        </button>

        <div className="flex items-center gap-x-2 text-gray-500">
          <ChartBarIcon className="w-5 h-5" />
          <p className="text-sm">{post.views} views</p>
        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)}>
        <h2 className="text-lg font-semibold mb-4">Report Post</h2>
        <textarea className="w-full border rounded-lg p-2 mt-2 mb-4" placeholder="Please provide a reason for reporting this post." onChange={(e) => {setReportReason(e.target.value)}}/>
        <button
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg"
          onClick={() => {
            handleReport();
            setIsReportModalOpen(false);
          }}
        >
          Submit Report
        </button>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <h2 className="text-lg font-semibold mb-4">Delete Post</h2>
        <p>Are you sure you want to delete this post? Please provide a reason if you are a moderator.</p>
        <textarea
          className="w-full border rounded-lg p-2 mt-2 mb-4"
          placeholder="Reason (optional)"
          onChange={(e) => {setDeleteReason(e.target.value)}} 
        />
        <button
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg"
          onClick={() => {
            handleDelete();
            setIsDeleteModalOpen(false);
          }}
        >
          Confirm Delete
        </button>
      </Modal>
    </div>
  );
};

export default PostCard;
