/**
 * Categories Repository
 * Quản lý danh mục trong DynamoDB - Không có mock data
 */

const BaseRepository = require("./base.repository");

class CategoriesRepository extends BaseRepository {
    constructor() {
        super("Categories", "id");
    }

    // Cập nhật category
    async updateCategory(id, data) {
        await this.update(id, data, { "#name": "name" });
    }
}

module.exports = new CategoriesRepository();
