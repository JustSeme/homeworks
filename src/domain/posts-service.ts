import { PostInputModel } from '../models/posts/PostInputModel'
import { PostViewModel } from '../models/posts/PostViewModel'
import { blogsQueryRepository } from '../repositories/query/blogs-query-repository'
import { postsRepository } from '../repositories/posts-db-repository'

export const postsService = {
    async deletePosts(id: string | null) {
        return await postsRepository.deletePosts(id)
    },

    async createPost(body: PostInputModel, blogId: string | null): Promise<PostViewModel> {
        const blogById = await blogsQueryRepository.findBlogById(blogId ? blogId : body.blogId)

        const createdPost: PostViewModel = {
            id: Date.now().toString(),
            title: body.title,
            shortDescription: body.shortDescription,
            content: body.content,
            blogId: blogId ? blogId : body.blogId,
            blogName: blogById?.name ? blogById?.name : 'not found',
            createdAt: new Date().toISOString(),
        }

        await postsRepository.createPost(createdPost)

        //@ts-ignore
        delete createdPost._id
        return createdPost
    },

    async updatePost(id: string, body: PostInputModel) {
        return await postsRepository.updatePost(id, body)
    }
}