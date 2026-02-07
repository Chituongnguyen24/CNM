require('dotenv').config();
const { CreateTableCommand, ListTablesCommand, DeleteTableCommand } = require('@aws-sdk/client-dynamodb');
const { client, docClient } = require('./config/dynamodb');
const { PutCommand, ScanCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

const TABLE_NAME = process.env.TABLE_NAME || 'Products';

// URL S3 bucket cho hình ảnh (region: ap-southeast-2)
const S3_IMAGE_URL = 'https://lab5-docker.s3.ap-southeast-2.amazonaws.com/images';

// Dữ liệu sản phẩm mẫu
const sampleProducts = [
    {
        id: uuidv4(),
        name: 'Camera',
        price: 15990000,
        url_image: `${S3_IMAGE_URL}/camera.avif`
    },
    {
        id: uuidv4(),
        name: 'Flycam',
        price: 25990000,
        url_image: `${S3_IMAGE_URL}/flycam.jpg`
    },
    {
        id: uuidv4(),
        name: 'Laptop',
        price: 32990000,
        url_image: `${S3_IMAGE_URL}/laptop.jpg`
    }
];

// Hàm delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Hàm xóa tất cả sản phẩm cũ
async function clearAllProducts() {
    console.log('\nĐang xóa sản phẩm cũ...');
    try {
        const data = await docClient.send(new ScanCommand({ TableName: TABLE_NAME }));
        if (data.Items && data.Items.length > 0) {
            for (const item of data.Items) {
                await docClient.send(new DeleteCommand({
                    TableName: TABLE_NAME,
                    Key: { id: item.id }
                }));
            }
            console.log(`  ✓ Đã xóa ${data.Items.length} sản phẩm cũ`);
        } else {
            console.log('  Không có sản phẩm cũ để xóa');
        }
    } catch (error) {
        console.error('  ✗ Lỗi khi xóa sản phẩm:', error.message);
    }
}

// Hàm thêm sản phẩm mẫu
async function seedProducts() {
    console.log('\nĐang thêm sản phẩm mẫu...');
    
    for (const product of sampleProducts) {
        try {
            await docClient.send(new PutCommand({
                TableName: TABLE_NAME,
                Item: product
            }));
            console.log(`  ✓ Đã thêm: ${product.name}`);
        } catch (error) {
            console.error(`  ✗ Lỗi khi thêm ${product.name}:`, error.message);
        }
    }
    
    console.log('\nHoàn thành thêm sản phẩm mẫu!');
}

async function createTable(retries = 5) {
    for (let i = 0; i < retries; i++) {
        try {
            // Kiểm tra xem table đã tồn tại chưa
            const listTables = await client.send(new ListTablesCommand({}));
            
            if (listTables.TableNames && listTables.TableNames.includes(TABLE_NAME)) {
                console.log(`Table "${TABLE_NAME}" đã tồn tại.`);
                // Xóa sản phẩm cũ và thêm sản phẩm mẫu mới
                await clearAllProducts();
                await seedProducts();
                return;
            }

            // Tạo table mới với các trường: id, name, price, url_image
            const params = {
                TableName: TABLE_NAME,
                KeySchema: [
                    { AttributeName: 'id', KeyType: 'HASH' }  // Partition key
                ],
                AttributeDefinitions: [
                    { AttributeName: 'id', AttributeType: 'S' }  // String
                ],
                ProvisionedThroughput: {
                    ReadCapacityUnits: 5,
                    WriteCapacityUnits: 5
                }
            };

            await client.send(new CreateTableCommand(params));
            console.log(`Table "${TABLE_NAME}" đã được tạo thành công!`);
            console.log('Các trường trong bảng: id, name, price, url_image');
            
            // Chờ table sẵn sàng rồi thêm sản phẩm mẫu
            await delay(2000);
            await seedProducts();
            return;
        } catch (error) {
            if (i < retries - 1) {
                console.log(`Đang chờ DynamoDB khởi động... (${i + 1}/${retries})`);
                await delay(3000);
            } else {
                console.error('Lỗi khi tạo table:', error);
            }
        }
    }
}

createTable();
