import { Request, Response, Router } from "express";
import { body } from "express-validator";
import { HTTP_STATUSES } from "../app";
import { jwtService } from "../application/jwtService";
import { authService } from "../domain/auth-service";
import { authMiddleware } from "../middlewares/auth/auth-middleware";
import { rateLimitMiddleware } from "../middlewares/auth/rate-limit-middleware";
import { inputValidationMiddleware } from "../middlewares/validations/input-validation-middleware";
import { LoginInputModel } from "../models/auth/LoginInputModel";
import { MeOutputModel } from "../models/auth/MeOutputModel";
import { ErrorMessagesOutputModel } from "../models/ErrorMessagesOutputModel";
import { UserInputModel } from "../models/users/UserInputModel";
import { usersQueryRepository } from "../repositories/query/users-query-repository";
import { RequestWithBody } from "../types/types";
import { emailValidationWithCustomSearch, loginValidation, passwordValidation } from "./users-router";

export const authRouter = Router({})

const loginOrEmailValidation = body('loginOrEmail')
    .exists()
    .trim()
    .notEmpty()
    .isString()

const emailValidation = body('email')
    .exists()
    .trim()
    .notEmpty()
    .isString()
    .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)

const newPasswordValidation = body('newPassword')
    .exists()
    .trim()
    .notEmpty()
    .isString()
    .isLength({ min: 6, max: 20 })

/* Напиши тесты */

authRouter.post('/login',
    rateLimitMiddleware,
    loginOrEmailValidation,
    passwordValidation,
    inputValidationMiddleware,
    async (req: RequestWithBody<LoginInputModel>, res: Response<ErrorMessagesOutputModel | { accessToken: string }>) => {
        const user = await authService.checkCredentials(req.body.loginOrEmail, req.body.password)
        if (!user) {
            res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
            return
        }

        const deviceName = req.headers["user-agent"] || 'undefined'
        const pairOfTokens = await jwtService.login(user.id, req.ip, deviceName)
        if (!pairOfTokens) {
            res.sendStatus(HTTP_STATUSES.NOT_IMPLEMENTED_501)
            return
        }

        res.cookie('refreshToken', pairOfTokens.refreshToken, { httpOnly: true, secure: true });
        res.send({
            accessToken: pairOfTokens.accessToken
        })
    })

authRouter.post('/refresh-token',
    async (req: Request, res: Response<{ accessToken: string }>) => {
        const refreshToken = req.cookies.refreshToken

        const newTokens = await jwtService.refreshTokens(refreshToken)
        if (!newTokens) {
            res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
            return
        }

        res.cookie('refreshToken', newTokens.newRefreshToken, { httpOnly: true, secure: true })
        res.send({
            accessToken: newTokens.newAccessToken
        })
    })

authRouter.post('/logout',
    (req: Request, res: Response) => {
        const refreshToken = req.cookies.refreshToken
        const isLogout = jwtService.logout(refreshToken)
        if (!isLogout) {
            res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
            return
        }

        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    })

authRouter.post('/registration',
    rateLimitMiddleware,
    loginValidation,
    passwordValidation,
    emailValidationWithCustomSearch,
    inputValidationMiddleware,
    async (req: RequestWithBody<UserInputModel>, res: Response<ErrorMessagesOutputModel>) => {
        const isCreated = await authService.createUser(req.body.login, req.body.password, req.body.email)
        if (!isCreated) {
            res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
            return
        }
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    })

authRouter.post('/registration-confirmation',
    rateLimitMiddleware,
    async (req: RequestWithBody<{ code: string }>, res: Response<ErrorMessagesOutputModel>) => {
        const isConfirmed = await authService.confirmEmail(req.body.code)
        if (!isConfirmed) {
            res
                .status(HTTP_STATUSES.BAD_REQUEST_400)
                .send({
                    errorsMessages: [{
                        message: 'The confirmation code is incorrect, expired or already been applied',
                        field: 'code'
                    }]
                })
            return
        }
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    })

authRouter.post('/registration-email-resending',
    rateLimitMiddleware,
    emailValidation,
    inputValidationMiddleware,
    async (req: RequestWithBody<{ email: string }>, res: Response<ErrorMessagesOutputModel>) => {
        const result = await authService.resendConfirmationCode(req.body.email)
        if (!result) {
            res
                .status(HTTP_STATUSES.BAD_REQUEST_400)
                .send({
                    errorsMessages: [{
                        message: 'Your email is already confirmed or doesnt exist',
                        field: 'email'
                    }]
                })
            return
        }
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    })

authRouter.post('/password-recovery',
    rateLimitMiddleware,
    emailValidation,
    inputValidationMiddleware,
    async (req: RequestWithBody<{ email: string }>, res: Response) => {
        const isRecovering = await authService.sendPasswordRecoveryCode(req.body.email)
        if (!isRecovering) {
            res.sendStatus(HTTP_STATUSES.NOT_IMPLEMENTED_501)
            return
        }

        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    })

authRouter.post('/new-password',
    rateLimitMiddleware,
    newPasswordValidation,
    inputValidationMiddleware,
    async (req: RequestWithBody<{ newPassword: string, recoveryCode: string }>, res: Response) => {
        const user = await usersQueryRepository.findUserByRecoveryPasswordCode(req.body.recoveryCode)
        if (!user || user.passwordRecovery.expirationDate < new Date()) {
            res.status(HTTP_STATUSES.BAD_REQUEST_400)
                .send({
                    errorsMessages: [{ message: 'recoveryCode is incorrect', field: 'recoveryCode' }]
                })
            return
        }

        const isConfirmed = await authService.confirmRecoveryPassword(user.id, req.body.newPassword)
        if (!isConfirmed) {
            res.sendStatus(HTTP_STATUSES.NOT_IMPLEMENTED_501)
            return
        }

        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    })

authRouter.get('/me',
    authMiddleware,
    async (req: Request, res: Response<MeOutputModel>) => {
        const accessToken = req.cookies('accessToken')
        const userId = await jwtService.getUserIdByToken(accessToken)
        const user = await usersQueryRepository.findUserById(userId)
        res.send({
            email: user!.email,
            login: user!.login,
            userId: user!.id
        })
    })