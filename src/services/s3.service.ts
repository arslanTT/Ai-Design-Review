import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.REGION!,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY!,
    secretAccessKey: process.env.SECRET_KEY!,
  },
});

export const uploadToS3 = async (file: any) => {
  const userID = "arslan";
  const key = `uploads/${Date.now()}-${file.originalname.replace(/\s/g, "_")}`;
  console.log("Key ==============>", key);
  let command = new PutObjectCommand({
    Bucket: process.env.BUCKET_NAME!,
    Key: `${userID}/${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: "public-read",
  });
  let response = await s3.send(command);
  console.log("S3 Response ==============>", response);
  const fileUrl = `https://${process.env.BUCKET_NAME!}.s3.${process.env
    .REGION!}.amazonaws.com/${key}`;
  console.log("File URl ==============>", fileUrl);
  return fileUrl;
};
