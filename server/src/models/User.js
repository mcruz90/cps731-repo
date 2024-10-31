const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// Define User model
// Sequelize automatically adds createdAt and updatedAt fields--will be used for JWT to limit token lifespan and log out user after a certain amount of time
const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, allowNull: false },
}, { timestamps: true});

module.exports = User;