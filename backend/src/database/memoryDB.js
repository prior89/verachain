// In-memory database for production when external MongoDB is not available
class MemoryDB {
  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.transactions = new Map();
    this.idCounter = 1;
  }

  // User operations
  async createUser(userData) {
    const id = this.idCounter++;
    const user = {
      _id: id.toString(),
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(id.toString(), user);
    return user;
  }

  async findUserByEmail(email) {
    for (const [id, user] of this.users) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async findUserByUsername(username) {
    for (const [id, user] of this.users) {
      if (user.username === username) {
        return user;
      }
    }
    return null;
  }

  async findUserById(id) {
    return this.users.get(id.toString()) || null;
  }

  // Product operations
  async createProduct(productData) {
    const id = this.idCounter++;
    const product = {
      _id: id.toString(),
      ...productData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.products.set(id.toString(), product);
    return product;
  }

  async findProductById(id) {
    return this.products.get(id.toString()) || null;
  }

  async findProductsByUser(userId) {
    const userProducts = [];
    for (const [id, product] of this.products) {
      if (product.userId === userId) {
        userProducts.push(product);
      }
    }
    return userProducts;
  }

  // Transaction operations
  async createTransaction(transactionData) {
    const id = this.idCounter++;
    const transaction = {
      _id: id.toString(),
      ...transactionData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.transactions.set(id.toString(), transaction);
    return transaction;
  }

  async findTransactionsByProduct(productId) {
    const productTransactions = [];
    for (const [id, transaction] of this.transactions) {
      if (transaction.productId === productId) {
        productTransactions.push(transaction);
      }
    }
    return productTransactions;
  }

  // Utility methods
  getAllUsers() {
    return Array.from(this.users.values());
  }

  getAllProducts() {
    return Array.from(this.products.values());
  }

  getAllTransactions() {
    return Array.from(this.transactions.values());
  }

  // Clear all data (for testing)
  clearAll() {
    this.users.clear();
    this.products.clear();
    this.transactions.clear();
    this.idCounter = 1;
  }

  // Get statistics
  getStats() {
    return {
      users: this.users.size,
      products: this.products.size,
      transactions: this.transactions.size
    };
  }
}

// Singleton instance
const memoryDB = new MemoryDB();

module.exports = memoryDB;