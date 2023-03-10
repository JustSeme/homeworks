import { DeviceAuthSessionsModelType } from '../models/devices/DeviceSessionsDBModel';
import { BlogViewModel } from '../models/blogs/BlogViewModel';
import { CommentDBModel } from '../models/comments/CommentDBModel';
import { PostViewModel } from '../models/posts/PostViewModel';
import { UserDBModel } from '../models/users/UserDBModel';
import { settings } from '../settings';
import { AttemptsDBModel } from '../models/auth/AttemptsDBModel';
import mongoose from 'mongoose';
import { usersSchema } from './schemas/usersSchema';
import { postsSchema } from './schemas/postsSchema';
import { blogsSchema } from './schemas/blogsSchema';
import { commentsSchema } from './schemas/commentsSchema';
import { deviceAuthSessionsSchema } from './schemas/deviceAuthSessionsSchema';
import { attemptsSchema } from './schemas/attemptsSchema';

let mongoURI = settings.mongoURI

export const PostsModel = mongoose.model<PostViewModel>('posts', postsSchema)
export const BlogsModel = mongoose.model<BlogViewModel>('blogs', blogsSchema)
export const UsersModel = mongoose.model<UserDBModel>('users', usersSchema)
export const CommentsModel = mongoose.model<CommentDBModel>('comments', commentsSchema)
export const DeviceAuthSessionsModel = mongoose.model<DeviceAuthSessionsModelType>('deviceAuthSessions', deviceAuthSessionsSchema)
export const AttemptsModel = mongoose.model<AttemptsDBModel>('attempts', attemptsSchema)

export async function runDB() {
    try {
        await mongoose.connect(mongoURI);
    } catch (err) {
        await mongoose.disconnect()
    }
}
runDB()
