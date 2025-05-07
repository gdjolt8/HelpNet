import mongoose from "mongoose";

export type User = {
    _id: string;
    username: string;
    password: string;
    email: string;
    creation_date: string;
    admin: boolean;
    banned: boolean;
    country: boolean;
    posts: [{title: string, description: string, id: string}];
    followers: {username: string, id: string}[];
    following: {username: string, id: string}[];
    replies: [{
      _id: string;
      creationDate: Date;
      content: string;
      images: string[];
      links: string[];
      views: number;
      likes: {username: string, date: Date}[];
    }];
    profile_picture_url: string;
    banned_data: {
        reason: string;
        start_date: Date;
        end_date: Date;
    };
    verified: boolean;
    verification_code: string | null;
}
const UserSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    email: {type: String, required: true},
    creation_date: {type: Number, required: true, default: Date.now},
    admin: {type: Boolean, required: true, default: false},
    banned: {type: Boolean, required: true, default: false},
    country: {type: String, required: true},
    posts: {type: [{title: String, description: String, id: String}], required: true},
    followers: {type: [{username: String, id: String}], required: true},
    following: {type: [{username: String, id: String}], required: true, default: []},
    replies: {type: [{
      _id: String,
      creationDate: Date,
      content: String,
      images: [String],
      links: [String],
      views: Number,
      likes: [{username: String, date: Date}],
    }], required: true},
    profile_picture_url: {type: String, required: true},
    banned_data: {type: {reason: String, start_date: Date, end_date: Date}, required: true},
    verified: { type: Boolean, default: false },
    verification_code: { type: String, default: null },
});

const Users = mongoose.models.Users || mongoose.model('Users', UserSchema);
export default Users;