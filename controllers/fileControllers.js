const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

// Set up AWS credentials and region
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY, // Your AWS access key
  secretAccessKey: process.env.AWS_SECRET_KEY, // Your AWS secret key
  region: process.env.AWS_REGION, // Your AWS region (e.g., 'us-west-2')
});

const s3 = new AWS.S3();

exports.generateUploadUrl = async (req, res, next) => {
  const fileName = req.query.fileName;
  const fileType = req.query.fileType;
  const expiration = 60;
  const fileId = uuidv4();

  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${fileId}-${fileName}`, // The name you want the uploaded file to have in S3
    Expires: expiration, // URL expiration time in seconds
    ContentType: fileType, // Required for upload URLs, set according to the file type
    Metadata: {
      "max-file-size": MAX_FILE_SIZE.toString(),
      fileId: fileId,
      // Store max size as metadata for client validation
    },
  };

  try {
    const url = await s3.getSignedUrlPromise("putObject", params);
    res.status(200).send({ url, fileKey: `${fileId}-${fileName}` });
  } catch (error) {
    console.error("Error generating presigned URL", error);
    res.status(500).send("Error generating presigned URL");
  }
};

// exports.confirmUpload = async (req, res) => {
//   const { fileId, fileName, fileType } = req.body;

//   try {
//     await File.create({
//       id: fileId,
//       name: fileName,
//       type: fileType,
//       uploadedAt: new Date(),
//       status: "uploaded",
//     });

//     res.status(200).send({ message: "Upload confirmed" });
//   } catch (error) {
//     console.error("Error saving file to database", error);
//     res.status(500).send("Error saving file to database");
//   }
// };

exports.getDownloadUrl = async ({ fileKey }) => {
  // Get fileId and fileName from client request
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileKey,
    Expires: 60 * 5, // URL expires in 5 minutes
  };

  try {
    const downloadUrl = await s3.getSignedUrlPromise("getObject", params);
    return downloadUrl;
  } catch (error) {
    console.log("error generating download url");
    return "";
  }
};

exports.getBatchDownloadUrls = async (fileKeys) => {
  const expiration = 60 * 5; // 5 minutes expiration time
  const downloadUrls = {};

  for (const key of fileKeys) {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Expires: expiration,
    };
    const url = await s3.getSignedUrlPromise("getObject", params);
    downloadUrls[key] = url; // Map fileKey to URL directly
  }

  return downloadUrls;
};
