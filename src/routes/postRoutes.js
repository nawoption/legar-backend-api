const express = require("express");
const { requireActiveDevice } = require("../middleware/device");
const { getPosts, getPost } = require("../controllers/postController");

const router = express.Router();

router.use(requireActiveDevice);
router.get("/", getPosts);
router.get("/:id", getPost);

module.exports = router;
