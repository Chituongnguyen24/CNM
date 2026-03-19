const path = require("path");
const crypto = require("crypto");
const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { s3Client, region } = require("./aws.clients");

const bucketName = process.env.S3_BUCKET;

const buildS3Url = (key) => {
    if (!bucketName || !key) {
        return "";
    }

    return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
};

const uploadProductImage = async (file) => {
    if (!file) {
        return { imageKey: "", imageUrl: "" };
    }

    if (!bucketName) {
        throw new Error("Thiếu biến môi trường S3_BUCKET");
    }

    const extension = path.extname(file.originalname || "").toLowerCase();
    const safeExtension = extension || ".jpg";
    const imageKey = `products/${Date.now()}-${crypto.randomUUID()}${safeExtension}`;

    await s3Client.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: imageKey,
        Body: file.buffer,
        ContentType: file.mimetype
    }));

    return {
        imageKey,
        imageUrl: buildS3Url(imageKey)
    };
};

const deleteImageByKey = async (imageKey) => {
    if (!bucketName || !imageKey) {
        return;
    }

    await s3Client.send(new DeleteObjectCommand({
        Bucket: bucketName,
        Key: imageKey
    }));
};

module.exports = {
    bucketName,
    buildS3Url,
    uploadProductImage,
    deleteImageByKey
};
