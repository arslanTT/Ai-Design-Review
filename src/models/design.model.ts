import mongoose from "mongoose";
export interface IAIResponse {
  date: Date;
  text: string;
  status: "Pending" | "Completed" | "Failed";
}
export interface IImage {
  asset_id: string;
  public_id: string;
  url: string;
}
export interface IDesign extends Document {
  title: string;
  description: string;
  likes: Number;
  owner: {
    _id: mongoose.Schema.Types.ObjectId;
    username: string;
  };
  imageDetails: IImage;
  clientSocketId: string;
  aiCritique?: IAIResponse;
  status?: "Uploaded" | "Processing";
}

const designSchema = new mongoose.Schema<IDesign>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    owner: {
      _id: { type: mongoose.Types.ObjectId, ref: "User", required: true },
      username: { type: String, required: true },
    },
    clientSocketId: {
      type: String,
    },
    imageDetails: {
      asset_id: {
        type: String,
        required: true,
      },
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    likes: {
      type: Number,
    },
    aiCritique: {
      date: Date,
      text: String,
      status: {
        type: String,
        enum: ["Uploaded", "Processing", "Completed", "Failed", "Error"],
        default: "Processing",
      },
    },
    status: {
      type: String,
      enum: ["Processing", "Failed", "Completed", "Error"],
      default: "Processing",
    },
  },

  { timestamps: true }
);

designSchema.virtual("comments", {
  ref: "Comment",
  foreignField: "desginPostID",
  localField: "_id",
});
designSchema.set("toJSON", { virtuals: true });
designSchema.set("toObject", { virtuals: true });
designSchema.index({ likes: -1 });
designSchema.index({ createdAt: -1 });
const Design = mongoose.model<IDesign>("Design", designSchema);
export default Design;
