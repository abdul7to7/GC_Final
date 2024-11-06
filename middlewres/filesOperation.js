// // uploadService.js

// const {
//   S3Client,
//   PutObjectCommand,
//   DeleteObjectCommand,
//   GetObjectCommand,
// } = require("@aws-sdk/client-s3");
// const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
// const File = require("../models/fileModel");
// // Adjust the path based on your project structure

// // Initialize AWS S3 Client
// const s3Client = new S3Client({
//   region: process.env.AWS_REGION,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY,
//     secretAccessKey: process.env.AWS_SECRET_KEY,
//   },
// });

// const uploadFileToS3 = async (file, groupMessageId, messageId) => {
//   const uploadParams = {
//     Bucket: process.env.AWS_BUCKET_NAME,
//     Key: `${Date.now()}-${file.name}`,
//     Body: file.data,
//     ContentType: file.type,
//   };

//   try {
//     const command = new PutObjectCommand(uploadParams);
//     await s3Client.send(command);

//     const fileRecord = await File.create({
//       fileId: uploadParams.Key,
//       fileUrl: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`,
//       fileName: file.name,
//       key: uploadParams.Key,
//       associatedGroupMessageId: groupMessageId ? groupMessageId : null,
//       associatedMessageId: messageId ? messageId : null,
//     });

//     return fileRecord;
//   } catch (err) {
//     console.error("Error uploading file to S3:", err);
//     throw new Error("Error uploading file to S3");
//   }
// };

// const deleteFileFromS3 = async (fileId) => {
//   const deleteParams = {
//     Bucket: process.env.AWS_BUCKET_NAME,
//     Key: fileId,
//   };

//   try {
//     const command = new DeleteObjectCommand(deleteParams);
//     await s3Client.send(command);
//   } catch (err) {
//     console.error("Error deleting file from S3:", err);
//     throw new Error("Error deleting file from S3");
//   }
// };

// async function generatePresignedUrl(key) {
//   const command = new GetObjectCommand({
//     Bucket: process.env.AWS_BUCKET_NAME,
//     Key: key,
//   });

//   const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
//   return url;
// }

// async function fileUpload(file, groupMessageId, messageId) {
//   let fileuploaded;
//   let preSignedUrl;

//   if (file.data) {
//     const fileSizeLimit = 10 * 1024 * 1024; // 10MB in bytes
//     const fileBuffer = Buffer.from(file.data, "base64"); // Convert base64 to buffer
//     const fileSize = fileBuffer.length;

//     if (fileSize > fileSizeLimit) {
//       return res.status(400).send("File size exceeds the 10MB limit.");
//     }
//     // const upload = multer({ storage: multer.memoryStorage() });
//     // upload.single("file");
//     fileuploaded = await uploadFileToS3(file, groupMessageId, messageId);
//     preSignedUrl = await generatePresignedUrl(fileuploaded.key);
//     return { ...fileuploaded, preSignedUrl };
//   }
// }

// module.exports = {
//   uploadFileToS3,
//   deleteFileFromS3,
//   generatePresignedUrl,
//   fileUpload,
// };
