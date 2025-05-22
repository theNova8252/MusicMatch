import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';

class Message extends Model {}

Message.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    senderId: { type: DataTypes.INTEGER, allowNull: false },
    receiverId: { type: DataTypes.INTEGER, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    // Optionally: read: { type: DataTypes.BOOLEAN, defaultValue: false }
  },
  {
    sequelize,
    modelName: 'Message',
  },
);

export default Message;
