import mongoose from "mongoose";

const ArticleSchema = new mongoose.Schema(
    {
     article: {
      type: String,
      required: true,
    },

    content: {
      type: String,
      required: true,
      unique: true,
    },
},
{timestamps:true}
)

const ArticleModel = mongoose.model("article",ArticleSchema)

export default ArticleModel