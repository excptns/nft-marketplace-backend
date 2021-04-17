const prisma = require("../../prisma");
let { hasNextPage } = require("../utils/request-utils");
let constants = require("../../config/constants");

/**
 * Includes all the Category services that controls
 * the Category Data object from the database
 */

class CategoryService {
  async createCategory(params, file) {
    try {
      let category = await prisma.categories.create({
        data: {
          name: params.name,
          description: params.description,
          url: params.url,
          img_url: file ? file.path : "",
          categoriesaddresses: {
            create: JSON.parse(params.address),
          },
          type: params.type,
          tokenURI: params.tokenURI,
        },
      });
      return category;
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getCategories({ limit, offset, orderBy }) {
    try {
      let where = {
        active: true,
      };

      let count = await prisma.categories.count({ where });
      let categories = await prisma.categories.findMany({
        where,
        orderBy,
        include: {
          categoriesaddresses: true,
          orders: { select: { id: true }, where: { status: 0 } },
        },
      });
      return {
        categories,
        limit,
        offset,
        has_next_page: hasNextPage({ limit, offset, count }),
      };
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getCategoryByAddress({ categoryAddress, chainId }) {
    try {
      let category = await prisma.categoriesaddresses.findOne({
        where: {
          address_chain_id: {
            address: categoryAddress,
            chain_id: chainId,
          },
        },
      });

      return category;
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async categoryExists(params) {
    try {
      let categories = await prisma.categories.findOne({
        where: { name: params.name },
      });
      return categories;
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async categoryAddressExists(params) {
    try {
      let categories = await prisma.categoriesaddresses.findOne({
        where: { address: params.address },
      });

      categories;
      return categories;
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getCategory(params) {
    try {
      let categories = await prisma.categories.findOne({
        where: { id: parseInt(params.categoryId) },
      });
      return categories;
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async updateCategory(params, file) {
    try {
      let current = await this.getCategory(params);
      let category = await prisma.categories.update({
        where: { id: parseInt(params.categoryId) },
        data: {
          description: params.description
            ? params.description
            : current.description,
          url: params.url ? params.url : current.url,
          img_url: file ? file.path : current.img_url,
          categoriesaddresses: {
            create: params.address ? JSON.parse(params.address) : [],
          },
          type: params.type ? params.type : current.type,
        },
      });
      return category;
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }
}

module.exports = CategoryService;
