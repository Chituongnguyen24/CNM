const { PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } = require("@aws-sdk/client-s3");
const { s3Client } = require("../config/aws");
const { v4: uuidv4 } = require("uuid");

const BUCKET = process.env.S3_BUCKET_NAME;
const REGION = process.env.AWS_REGION;

exports.listImages = async () => {
    try {
        const command = new ListObjectsV2Command({ 
            Bucket: BUCKET,
            Prefix: 'products/images/'
        });
        const result = await s3Client.send(command);
        
        if (!result.Contents) return [];
        
        // Lọc chỉ lấy file ảnh, bỏ qua folder
        return result.Contents
            .filter(obj => obj.Key !== 'products/images/' && obj.Size > 0)
            .map(obj => ({
                key: obj.Key,
                url: `https://${BUCKET}.s3.${REGION}.amazonaws.com/${obj.Key}`,
                size: obj.Size,
                lastModified: obj.LastModified
            }));
    } catch (error) {
        console.error("S3 List Error:", error.message);
        return [];
    }
};

exports.uploadImage = async (file) => {
    try {
        const key = `products/images/${file.originalname}`;

        const command = new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype
        });

        await s3Client.send(command);

        return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
    } catch (error) {
        console.error("S3 Upload Error:", error.message);
        console.log("Running without S3 image storage...");
        return "";
    }
};

exports.deleteImageByUrl = async (url) => {
    try {
        if (!url) return;
        const prefix = `https://${BUCKET}.s3.${REGION}.amazonaws.com/`;
        const altPrefix = `https://${BUCKET}.s3.amazonaws.com/`;
        let key;
        if (url.startsWith(prefix)) {
            key = url.substring(prefix.length);
        } else if (url.startsWith(altPrefix)) {
            key = url.substring(altPrefix.length);
        } else {
            return;
        }

        const command = new DeleteObjectCommand({
            Bucket: BUCKET,
            Key: key
        });

        await s3Client.send(command);
    } catch (error) {
        console.error("S3 Delete Error:", error.message);
    }
};
