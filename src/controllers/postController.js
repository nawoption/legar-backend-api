const { validationResult } = require("express-validator");
const Post = require("../models/Post");

const getPosts = async (req, res, next) => {
    try {
        const posts = await Post.find();
        res.json(posts);
    } catch (error) {
        next(error);
    }
};

const createPost = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const post = await Post.create(req.body);
        res.status(201).json(post);
    } catch (error) {
        next(error);
    }
};

const updatePost = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!post) return res.status(404).json({ message: "Post not found" });
        res.json(post);
    } catch (error) {
        next(error);
    }
};

const deletePost = async (req, res, next) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

module.exports = { getPosts, createPost, updatePost, deletePost };
