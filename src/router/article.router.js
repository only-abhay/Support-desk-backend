import express from "express"


const ArticleRouter = express.Router()
import postData, { DeleteById, getArticle } from "../controller/article.controller.js"
import Protect, { Authorized } from "../middleware/protect.js"

ArticleRouter.post("/create" , Protect, Authorized("admin"),postData)
ArticleRouter.get("/get",getArticle)
ArticleRouter.delete("/delete/:id",Protect,Authorized("admin"),DeleteById)

export default ArticleRouter