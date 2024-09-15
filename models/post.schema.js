const mongoose =require("mongoose")

const postschema = mongoose.Schema({

     title:String,
     description:String,
     blogImg:String,

     createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "user"
     },
},

     {timestamps:true}
);

module.exports = mongoose.model("post",postschema)
