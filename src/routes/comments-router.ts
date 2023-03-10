import { Router, Response } from "express";
import { body } from "express-validator";
import { HTTP_STATUSES } from "../app";
import { commentsService } from "../domain/comments-service";
import { authMiddleware } from "../middlewares/auth/auth-middleware";
import { commentIdValidationMiddleware } from "../middlewares/validations/commentId-validation-middleware";
import { inputValidationMiddleware } from "../middlewares/validations/input-validation-middleware";
import { ownershipValidationMiddleware } from "../middlewares/validations/ownership-validation-middleware";
import { CommentInputModel } from "../models/comments/CommentInputModel";
import { CommentViewModel } from "../models/comments/CommentViewModel";
import { LikeModel } from "../models/comments/LikeModel";
import { ErrorMessagesOutputModel } from "../models/ErrorMessagesOutputModel";
import { commentsQueryRepository } from "../repositories/query/comments-query-repository";
import { RequestWithParams, RequestWithParamsAndBody } from "../types/types";

export const commentsRouter = Router({})

export const commentContentValidation = body('content')
    .exists()
    .trim()
    .notEmpty()
    .isString()
    .isLength({ min: 20, max: 300 })

const likeValidation = body('likeStatus')
    .exists()
    .trim()
    .custom(value => {
        if (value === 'None' || value === 'Like' || value === 'Dislike') {
            return true
        }
        throw new Error('likeStatus is incorrect')
    })

commentsRouter.get('/:commentId',
    async (req: RequestWithParams<{ commentId: string }>, res: Response<CommentViewModel>) => {
        const findedComment = await commentsQueryRepository.findCommentById(req.params.commentId)
        if (!findedComment) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
            return
        }

        res.send(findedComment!)
    })

commentsRouter.delete('/:commentId',
    authMiddleware,
    commentIdValidationMiddleware,
    ownershipValidationMiddleware,
    async (req: RequestWithParams<{ commentId: string }>, res: Response) => {
        const isDeleted = await commentsService.deleteComment(req.params.commentId)
        if (!isDeleted) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
            return
        }

        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    })

commentsRouter.put('/:commentId',
    authMiddleware,
    commentIdValidationMiddleware,
    ownershipValidationMiddleware,
    commentContentValidation,
    inputValidationMiddleware,
    async (req: RequestWithParamsAndBody<{ commentId: string }, CommentInputModel>, res: Response<ErrorMessagesOutputModel>) => {
        const isUpdated = await commentsService.updateComment(req.params.commentId, req.body.content)
        if (!isUpdated) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
            return
        }

        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    })

commentsRouter.put('/:commentId/like-status',
    authMiddleware,
    commentIdValidationMiddleware,
    likeValidation,
    (req: RequestWithParamsAndBody<{ commentId: string }, LikeModel>, res: Response) => {
        res.send('ok')
    })