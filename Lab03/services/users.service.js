const { PutCommand, ScanCommand, GetCommand, UpdateCommand, DeleteCommand, QueryCommand } =
    require("@aws-sdk/lib-dynamodb");
const { dynamoClient } = require("../config/aws");
const crypto = require("crypto");

const TABLE_NAME = "Users";

// Hash password using SHA256
function hashPassword(password) {
    return crypto.createHash("sha256").update(password).digest("hex");
}

// Verify password
function verifyPassword(password, hashedPassword) {
    return hashPassword(password) === hashedPassword;
}

// Get all users
exports.getAllUsers = async () => {
    try {
        const command = new ScanCommand({ TableName: TABLE_NAME });
        const result = await dynamoClient.send(command);
        return (result.Items || []).map(u => ({ ...u, password: undefined }));
    } catch (error) {
        console.error("❌ AWS DynamoDB Error (Users):", error.message);
        throw error;
    }
};

// Get user by ID
exports.getUserById = async (id) => {
    try {
        const command = new GetCommand({
            TableName: TABLE_NAME,
            Key: { id }
        });
        const result = await dynamoClient.send(command);
        if (result.Item) {
            return { ...result.Item, password: undefined };
        }
        return null;
    } catch (error) {
        console.error("AWS Error:", error.message);
        throw error;
    }
};

// Get user by username (for login)
exports.getUserByUsername = async (username) => {
    try {
        const command = new ScanCommand({
            TableName: TABLE_NAME,
            FilterExpression: "username = :username",
            ExpressionAttributeValues: {
                ":username": username
            }
        });
        const result = await dynamoClient.send(command);
        return result.Items && result.Items.length > 0 ? result.Items[0] : null;
    } catch (error) {
        console.error("AWS Error:", error.message);
        throw error;
    }
};

// Create user
exports.createUser = async (user) => {
    const newUser = {
        ...user,
        password: hashPassword(user.password),
        createdAt: new Date().toISOString()
    };

    try {
        const command = new PutCommand({
            TableName: TABLE_NAME,
            Item: newUser
        });
        await dynamoClient.send(command);
        return { ...newUser, password: undefined };
    } catch (error) {
        console.error("AWS Error:", error.message);
        throw error;
    }
};

// Update user
exports.updateUser = async (id, data) => {
    try {
        let updateExpression = "set username = :username, #role = :role";
        const expressionAttributeValues = {
            ":username": data.username,
            ":role": data.role
        };
        const expressionAttributeNames = {
            "#role": "role"
        };

        if (data.password) {
            updateExpression += ", password = :password";
            expressionAttributeValues[":password"] = hashPassword(data.password);
        }

        const command = new UpdateCommand({
            TableName: TABLE_NAME,
            Key: { id },
            UpdateExpression: updateExpression,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues
        });
        await dynamoClient.send(command);
    } catch (error) {
        console.error("AWS Error:", error.message);
        throw error;
    }
};

// Delete user
exports.deleteUser = async (id) => {
    try {
        const command = new DeleteCommand({
            TableName: TABLE_NAME,
            Key: { id }
        });
        await dynamoClient.send(command);
    } catch (error) {
        console.error("AWS Error:", error.message);
        throw error;
    }
};

// Authenticate user (login)
exports.authenticateUser = async (username, password) => {
    try {
        const user = await exports.getUserByUsername(username);
        if (!user) {
            return { success: false, message: "Tên đăng nhập không tồn tại" };
        }
        if (!verifyPassword(password, user.password)) {
            return { success: false, message: "Mật khẩu không đúng" };
        }
        return { 
            success: true, 
            user: { 
                id: user.id, 
                username: user.username, 
                role: user.role 
            } 
        };
    } catch (error) {
        console.error("AWS Error:", error.message);
        return { success: false, message: "Lỗi kết nối cơ sở dữ liệu" };
    }
};

// Export hash function for external use
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
