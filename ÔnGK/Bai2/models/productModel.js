const {
  ScanCommand,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand
} = require("@aws-sdk/lib-dynamodb");
const { docClient, TABLE_NAME } = require("../config/dynamodb");
const send = (Command, params) => docClient.send(new Command({ TableName: TABLE_NAME, ...params }));

async function getAllProducts(search = "") {
  const params = {};

  if (search) {
    params.FilterExpression = "contains(#name, :q)";
    params.ExpressionAttributeNames = { "#name": "name" };
    params.ExpressionAttributeValues = { ":q": search };
  }

  const result = await send(ScanCommand, params);
  const items = result.Items || [];

  return items.sort((a, b) => a.name.localeCompare(b.name));
}

async function getProductById(id) {
  const result = await send(GetCommand, { Key: { id } });
  return result.Item;
}

async function createProduct(product) {
  await send(PutCommand, { Item: product });
}

async function updateProduct(id, product) {
  await send(UpdateCommand, {
    Key: { id },
    UpdateExpression:
      "SET #name = :name, price = :price, unit_in_stock = :unit_in_stock, url_image = :url_image",
    ExpressionAttributeNames: { "#name": "name" },
    ExpressionAttributeValues: {
      ":name": product.name,
      ":price": product.price,
      ":unit_in_stock": product.unit_in_stock,
      ":url_image": product.url_image
    }
  });
}

async function deleteProduct(id) {
  await send(DeleteCommand, { Key: { id } });
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
