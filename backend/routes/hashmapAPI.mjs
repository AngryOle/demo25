import express from "express";

const hashmapRouter = express.Router();

hashmapRouter.get("/", (req, res) => {
    res.json({ message: "Hashmap API working!" });
});

export default hashmapRouter;