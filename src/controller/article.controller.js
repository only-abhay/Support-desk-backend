import ArticleModel from "../models/article.model.js";
import { BadRequest, NoContent, OK } from "../utils/response.js";

const postData = async (req, res) => {
  try {
    const { data } = req.body;
    if (!data) {
      return NoContent();
    }
    await ArticleModel.create({
      article: data.article,
      content: data.content,
    });
    const article = await ArticleModel.find();
    return res.status(201).json({
      success: true,
      article,
    });
  } catch (error) {
    return NoContent()
  }
};

export const getArticle = async (req,res)=>{
   try {
    const article = await ArticleModel.find()
    if(!article){
      return NoContent()
    }
    return res.status(200).json(
        {
            success:true,
            article
        }
    )

   } catch (error) {
    return NoContent()
   }

}

 export const DeleteById = async (req,res)=>{
  try {
    const {id}=req.params
    const Article = await ArticleModel.findByIdAndDelete(id)
    if (!Article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Article Deleted",
    });
  } catch (error) {
    console.log(error)
  }
}



export default postData;
