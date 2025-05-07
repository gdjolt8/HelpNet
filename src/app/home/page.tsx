"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookie from "js-cookie";
import { User } from "@/models/User";
import { Post } from "@/models/Post"; // Import Post type
import { getToken } from "@/lib/functions";
import { supabase } from "@/lib/supabaseClient"; // Import Supabase client
import PostCard from "@/components/PostCard";
import Sidebar from "@/components/Sidebar";
import {
  PencilIcon,
  ClipboardDocumentListIcon,
  PhotoIcon,
  LinkIcon,
  CheckCircleIcon,
  DocumentPlusIcon,
} from "@heroicons/react/24/outline";


const HomePage = () => {
  const [posts, setPosts] = useState<Post[]>([]); // State for posts with Post type
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [acc, setAcc] = useState<User | null>(null);
  const [followerOnly, setFollowerOnly] = useState(false);
  const router = useRouter();

  // Token validation and post fetching
  useEffect(() => {
    const initializePage = async () => {
      const token = await getToken(Cookie.get("authorization") || ""); // Simplified token fetching

      if (!token || token.ok === false) {
        router.push("/login"); // Redirect to login if token invalid
      } else {
        setAcc(token.account); // Set user account details
        fetchPosts(); // Fetch posts
        setIsLoading(false); // Stop loading
      }
    };

    initializePage();
  }, [router]);

  // Fetch posts from API
  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/posts", { method: "GET", headers: { "Content-Type": "application/json" } });
      const data = await res.json();
      data.filter((post: Post) => post.deleted != false);
      setPosts(data); // Set posts to fetched data
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    }
  };

  // Function to upload images to Supabase
  const uploadImages = async (images: File[]) => {
    const imageUrls: string[] = [];
  
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
  
    return imageUrls;
  };
  

  // Handle creating a new post
  const handlePost = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const title = formData.get("title")?.toString() || "";
    const description = formData.get("description")?.toString() || "";
    const content = formData.get("content")?.toString() || "";
    const images = formData.getAll("images").filter((file) => file instanceof File) as File[];
    const links = (formData.get("links") !== "" ? formData.get("links")?.toString()?.split(",") : []);
    const author = acc?.username || "Anonymous"; // Use authenticated user's username
    // Ensure images array is not empty before proceeding
    if (images.length === 0) {
    }
  
    try {
      // Upload images and get their URLs
      const imageUrls = images.length > 0 ? (images[0].name == "" ? [] : await uploadImages(images)) : [];
  
      const postData = {
        title,
        description,
        creationDate: new Date(),
        content,
        images: imageUrls,  // Use the uploaded image URLs (empty array if no images)
        links,
        user: author,
        views: 0,
        replies: [],
        follower_only: followerOnly,
      };
  
      const newPost = await (await fetch("/api/post", {
        method: "POST",
        body: JSON.stringify(postData),
        headers: {
          "Content-Type": "application/json",
        },
      })).json();
  
      setPosts((prevPosts) => [newPost, ...prevPosts]); // Add new post to state

      form.reset();
      
    } catch (error) {
      console.error("Failed to create post:", error);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-black">
      <Sidebar username={acc?.username} />
  
      <main className="flex-1 bg-gray-100 p-6 overflow-y-auto">
        <form
          className="my-6 p-6 border rounded-lg bg-white shadow-lg space-y-4"
          onSubmit={handlePost}
        >
          {/* Title Input */}
          <div className="relative">
            <PencilIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              name="title"
              placeholder="Title"
              className="w-full px-10 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-700"
              required
            />
          </div>
  
          {/* Description Textarea */}
          <div className="relative">
            <ClipboardDocumentListIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <textarea
              name="description"
              placeholder="Brief description..."
              className="w-full px-10 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-700 resize-none"
              rows={2}
              required
            />
          </div>
  
          {/* Content Textarea */}
          <div className="relative">
            <DocumentPlusIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <textarea
              name="content"
              placeholder="Share your knowledge or question..."
              className="w-full px-10 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-700 resize-none"
              rows={4}
              required
            />
          </div>
  
          {/* File Upload and Links */}
          <div className="space-y-4">
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
            <div className="relative">
              <LinkIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="links"
                placeholder="Add links (comma separated)"
                className="w-full px-10 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-700"
              />
            </div>
          </div>
  
          {/* Follower Only Checkbox */}
          <div className="flex items-center space-x-2 mt-4">
            <CheckCircleIcon className="h-5 w-5 text-blue-600" />
            <input
              type="checkbox"
              checked={followerOnly}
              onChange={(e) => setFollowerOnly(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="text-gray-700">
              Allow this post to only be visible to followers?
            </label>
          </div>
  
          {/* Submit Button */}
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="flex items-center bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            >
              <DocumentPlusIcon className="mr-2 h-5 w-5" /> Post
            </button>
          </div>
        </form>
  
        {/* Posts Section */}
        <div className="space-y-4">
          {posts.length > 0 ? (
            posts
              .filter((post) => !post.deleted) // Filter deleted posts here
              .map((post) => <PostCard key={post._id} post={post} />)
          ) : (
            <div>No posts available</div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HomePage;
