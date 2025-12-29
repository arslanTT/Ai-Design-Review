import mongoose from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
  _id: any;
  username: string;
  email: string;
  password: string;
  tokens: number;
  role: "user" | "admin";
  comparepassword(candidatepassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      // select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    tokens: { type: Number, default: 3 },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
userSchema.virtual("Service", {
  ref: "Service",
  localField: "_id",
  foreignField: "provider",
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

userSchema.methods.comparepassword = async function (
  candidatepassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatepassword, this.password);
  } catch (error) {
    throw new Error("Password comparison failed");
  }
  return true;
};

const User = mongoose.model<IUser>("User", userSchema);
export default User;
