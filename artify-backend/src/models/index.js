const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: false },
  phone: DataTypes.STRING,
  address: DataTypes.TEXT,
  avatarUrl: DataTypes.STRING,
  role: { type: DataTypes.ENUM('CUSTOMER', 'ARTIST', 'ADMIN'), allowNull: false, defaultValue: 'CUSTOMER' }
}, { tableName: 'users' });

const Artist = sequelize.define('Artist', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  bio: DataTypes.TEXT,
  portfolioUrl: DataTypes.STRING,
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  rating: { type: DataTypes.DOUBLE, defaultValue: 0.0 },
  userId: { type: DataTypes.BIGINT, allowNull: false, unique: true }
}, { tableName: 'artists', timestamps: false });

const Category = sequelize.define('Category', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  description: DataTypes.TEXT,
  imageUrl: DataTypes.STRING
}, { tableName: 'categories', timestamps: false });

const Product = sequelize.define('Product', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(200), allowNull: false },
  description: DataTypes.TEXT,
  price: { type: DataTypes.DOUBLE, allowNull: false },
  imageUrl: DataTypes.STRING,
  stock: { type: DataTypes.INTEGER, defaultValue: 0 },
  status: { type: DataTypes.ENUM('ACTIVE', 'SOLD', 'DRAFT'), allowNull: false, defaultValue: 'ACTIVE' },
  artistId: { type: DataTypes.BIGINT, allowNull: false },
  categoryId: { type: DataTypes.BIGINT, allowNull: true }
}, { tableName: 'products' });

const Cart = sequelize.define('Cart', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.BIGINT, allowNull: false }
}, { tableName: 'carts', timestamps: false });

const CartItem = sequelize.define('CartItem', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  cartId: { type: DataTypes.BIGINT, allowNull: false },
  productId: { type: DataTypes.BIGINT, allowNull: false }
}, { tableName: 'cart_items', timestamps: false });

const Order = sequelize.define('Order', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  totalAmount: { type: DataTypes.DOUBLE, allowNull: false },
  shippingAddress: DataTypes.TEXT,
  status: { type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'), allowNull: false, defaultValue: 'PENDING' }
}, { tableName: 'orders' });

const OrderItem = sequelize.define('OrderItem', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  priceAtPurchase: { type: DataTypes.DOUBLE, allowNull: false },
  orderId: { type: DataTypes.BIGINT, allowNull: false },
  productId: { type: DataTypes.BIGINT, allowNull: false }
}, { tableName: 'order_items' });

const Payment = sequelize.define('Payment', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  method: { type: DataTypes.ENUM('CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'NET_BANKING', 'WALLET', 'CASH_ON_DELIVERY'), allowNull: false },
  transactionId: { type: DataTypes.STRING, unique: true },
  amount: { type: DataTypes.DOUBLE, allowNull: false },
  status: { type: DataTypes.ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'), allowNull: false, defaultValue: 'PENDING' },
  paidAt: DataTypes.DATE,
  orderId: { type: DataTypes.BIGINT, allowNull: false, unique: true }
}, { tableName: 'payments', timestamps: false });

const Review = sequelize.define('Review', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  rating: { type: DataTypes.INTEGER, allowNull: false },
  comment: DataTypes.TEXT,
  userId: { type: DataTypes.BIGINT, allowNull: false },
  productId: { type: DataTypes.BIGINT, allowNull: false }
}, { tableName: 'reviews' });

// Associations mirror the JPA relationships.
User.hasOne(Artist, { foreignKey: 'userId', as: 'artist', onDelete: 'CASCADE' });
Artist.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasOne(Cart, { foreignKey: 'userId', as: 'cart', onDelete: 'CASCADE' });
Cart.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Artist.hasMany(Product, { foreignKey: 'artistId', as: 'products', onDelete: 'CASCADE' });
Product.belongsTo(Artist, { foreignKey: 'artistId', as: 'artist' });

Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

Cart.hasMany(CartItem, { foreignKey: 'cartId', as: 'items', onDelete: 'CASCADE' });
CartItem.belongsTo(Cart, { foreignKey: 'cartId', as: 'cart' });
CartItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasMany(CartItem, { foreignKey: 'productId', as: 'cartItems' });

User.hasMany(Order, { foreignKey: 'userId', as: 'orders', onDelete: 'CASCADE' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'orderItems' });

Order.hasOne(Payment, { foreignKey: 'orderId', as: 'payment', onDelete: 'CASCADE' });
Payment.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

User.hasMany(Review, { foreignKey: 'userId', as: 'reviews', onDelete: 'CASCADE' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Product.hasMany(Review, { foreignKey: 'productId', as: 'reviews', onDelete: 'CASCADE' });
Review.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

module.exports = {
  sequelize, User, Artist, Category, Product, Cart, CartItem,
  Order, OrderItem, Payment, Review
};
