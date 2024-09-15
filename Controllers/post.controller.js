const usermodel = require("../models/post.schema");
const imagekit = require("../utils/imagekit");

exports.createpost = async function (req, res, next) {c
    res.render("createpost", {title: "Create Post"});
};

