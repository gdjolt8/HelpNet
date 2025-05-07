import { PublicUserInfo } from "@/app/api/getUserInfo/route";
import mongoose from "mongoose";
import { ReportType } from "./Report";

export type Reply = {
  _id: string;
  creationDate: Date;
  content: string;
  images: string[];
  links: string[];
  author: PublicUserInfo;
  views: number;
  likes: {username: string, date: Date}[];
};

export type Post = {
  _id: string;
  title: string;
  description: string;
  creationDate: Date;
  content: string;
  images: string[];
  links: string[];
  author: string;
  views: number;
  likes: {username: string, date: Date}[];
  replies: Reply[];
  deleted: boolean;
  follower_only: boolean;
  reports: ReportType[];
}

const PostSchema = new mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    creationDate: {type: Date, required: true},
    content: {type: String, required: true},
    images: [
        {
          type: String, // Array of image URLs
        },
      ],
    links: [
        {
          type: String, // Array of URLs extracted from content
        },
    ],
    author: {type: String, required: true},
    views: {type: Number, required: true},
    likes: {type: [{username: String, date: Date}], required: true},
    replies: {type: [{
      _id: String,
      creationDate: Date,
      content: String,
      images: [String],
      links: [String],
      author: {username: String, profile_picture_url: String, followers: [String], following: [String], admin: Boolean},
      views: Number,
      likes: {type: [{username: String, date: Date}], required: true},
    }], required: true},
    deleted: {type: Boolean, default: false},
    follower_only: {type: Boolean, default: false},
    reports: {type: [{postId: String, message: String, date: String }], required: true, default: []},
});

const Posts = mongoose.models.Posts || mongoose.model('Posts', PostSchema);
export default Posts;