import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import Design from "../models/design.model.js";
import Comment from "../models/comment.model.js";

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  throw new Error("MONGODB_URI missing");
} else {
  console.log("Hello");
}
await mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 15000,
  family: 4,
});
const USERS_COUNT = 20;

const generateUsers = () => {
  return Array.from({ length: USERS_COUNT }).map((_, i) => ({
    username: `user_${i + 1}`,
    email: `user_${i + 1}@example.com`,
    password: "password123", // bcrypt will hash
    role: "user",
    tokens: Math.floor(Math.random() * 5) + 1,
  }));
};
const images = [
  "https://images.unsplash.com/photo-1522199710521-72d69614c702",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
  "https://images.unsplash.com/photo-1556761175-4b46a572b786",
  "https://images.unsplash.com/photo-1502920514313-52581002a659",
  "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f",
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0",
  "https://images.unsplash.com/photo-1554284126-aa88f22d8b74",
  "https://images.unsplash.com/photo-1621416894569-0f39ed31d247",
];

const titles = [
  "SaaS Landing Page",
  "Mobile Banking App",
  "E-commerce Product Page",
  "Analytics Dashboard",
  "Designer Portfolio",
  "Fitness Tracking App",
  "Crypto Wallet UI",
  "Travel Booking Platform",
  "Online Learning Dashboard",
  "Restaurant Website",
];

const descriptions = [
  "Modern UI focused on usability and clarity.",
  "High-conversion layout with strong visual hierarchy.",
  "Dark mode interface with accessibility in mind.",
  "Minimal design with emphasis on content.",
  "User-centric design optimized for engagement.",
];

const critiqueTexts = [
  "Excellent spacing and layout. Consider improving color contrast.",
  "Typography is clean but could use more hierarchy.",
  "Strong visuals overall. CTA placement could be refined.",
  "Good consistency. Some sections feel visually dense.",
];

const feedbackTexts = [
  "This looks really professional!",
  "Nice layout, very intuitive.",
  "I like the color choices.",
  "Could use better spacing in some areas.",
  "Typography feels clean and readable.",
];
const DESIGN_COUNT = 100;

const generateDesigns = (users) => {
  return Array.from({ length: DESIGN_COUNT }).map((_, i) => {
    const statusPool = ["Completed", "Processing", "Failed"];
    const status = statusPool[Math.floor(Math.random() * statusPool.length)];

    const owner = users[Math.floor(Math.random() * users.length)];

    return {
      title: titles[i % titles.length],
      description: descriptions[i % descriptions.length],
      owner: {
        _id: owner._id,
        username: owner.username,
      },
      clientSocketId: `socket_${i + 1}`,
      imageDetails: {
        asset_id: `unsplash-${i}`,
        public_id: `design_${i}`,
        url: images[i % images.length],
      },
      likes: Math.floor(Math.random() * 500),
      aiCritique:
        status === "Completed"
          ? {
              date: new Date(),
              text: critiqueTexts[i % critiqueTexts.length],
              status: "Completed",
            }
          : {
              date: new Date(),
              text: "AI critique pending...",
              status: "Processing",
            },
      status,
    };
  });
};
const generateComments = (designs, users) => {
  const comments = [];

  designs.forEach((design) => {
    const count = Math.floor(Math.random() * 6) + 3;

    for (let i = 0; i < count; i++) {
      const user = users[Math.floor(Math.random() * users.length)];

      comments.push({
        user: user._id,
        desginPostID: design._id,
        feedback:
          feedbackTexts[Math.floor(Math.random() * feedbackTexts.length)],
      });
    }
  });

  return comments;
};
const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    await User.deleteMany();
    await Design.deleteMany();
    await Comment.deleteMany();

    const users = await User.insertMany(generateUsers());
    console.log(`👤 Inserted ${users.length} users`);

    const designs = await Design.insertMany(generateDesigns(users));
    console.log(`🎨 Inserted ${designs.length} designs`);

    const comments = generateComments(designs, users);
    await Comment.insertMany(comments);
    console.log(`💬 Inserted ${comments.length} comments`);

    console.log("✅ Seeding complete");
    process.exit();
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
};

export default seed;
