"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blogsRouter = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const app_1 = require("../app");
const input_validation_middleware_1 = require("../middlewares/input-validation-middleware");
const blogs_repository_1 = require("../repositories/blogs-repository");
exports.blogsRouter = (0, express_1.Router)({});
const nameValidation = (0, express_validator_1.body)('name').isString().isLength({ min: 1, max: 15 });
const descriptionValidation = (0, express_validator_1.body)('description').isString().isLength({ min: 1, max: 500 });
const websiteUrlValidation = (0, express_validator_1.body)('websiteUrl').isString().isURL().isLength({ min: 1, max: 100 });
exports.blogsRouter.get('/', (req, res) => {
    const findedBlog = blogs_repository_1.blogsRepository.findBlogs(null);
    if (!findedBlog) {
        res.sendStatus(app_1.HTTP_STATUSES.NOT_FOUND_404);
    }
    res.json(findedBlog);
});
exports.blogsRouter.get('/:id', (req, res) => {
    const findedBlog = blogs_repository_1.blogsRepository.findBlogs(req.params.id);
    if (!findedBlog) {
        res.sendStatus(app_1.HTTP_STATUSES.NOT_FOUND_404);
    }
    res.json(findedBlog);
});
exports.blogsRouter.post('/', nameValidation, descriptionValidation, websiteUrlValidation, input_validation_middleware_1.inputValidationMiddleware, (req, res) => {
    const createdBlog = blogs_repository_1.blogsRepository.createBlog(req.body);
    res
        .status(app_1.HTTP_STATUSES.OK_200)
        .send(createdBlog);
});
exports.blogsRouter.put('/:id', nameValidation, descriptionValidation, websiteUrlValidation, input_validation_middleware_1.inputValidationMiddleware, (req, res) => {
    const findedBlog = blogs_repository_1.blogsRepository.findBlogs(req.params.id);
    if (!findedBlog) {
        res.sendStatus(app_1.HTTP_STATUSES.NOT_FOUND_404);
        return;
    }
    blogs_repository_1.blogsRepository.updateBlog(req.params.id, req.body);
    res.sendStatus(app_1.HTTP_STATUSES.NO_CONTENT_204);
});
exports.blogsRouter.delete('/:id', (req, res) => {
    const findedBlog = blogs_repository_1.blogsRepository.findBlogs(req.params.id);
    if (!findedBlog) {
        res.sendStatus(app_1.HTTP_STATUSES.NOT_FOUND_404);
        return;
    }
    blogs_repository_1.blogsRepository.deleteBlog(req.params.id);
});
//# sourceMappingURL=blogs-router.js.map