import mongoose from "mongoose";

export interface IComment extends Document {
  user: mongoose.Schema.Types.ObjectId;
  desginPostID: mongoose.Schema.Types.ObjectId;
  feedback: String;
}
const commentSchema = new mongoose.Schema<IComment>(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    desginPostID: {
      type: mongoose.Types.ObjectId,
      ref: "Design",
      required: true,
    },
    feedback: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
commentSchema.index({ desginPostID: 1, createdAt: -1 });

const Comment = mongoose.model<IComment>("Comment", commentSchema);
export default Comment;
