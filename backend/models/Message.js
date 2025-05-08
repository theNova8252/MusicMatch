import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';

const Message = sequelize.define(
  'Message',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    content: { type: DataTypes.TEXT, allowNull: false },
    senderId: { type: DataTypes.INTEGER, allowNull: false },
    receiverId: { type: DataTypes.INTEGER, allowNull: false },
    read: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    timestamps: true,
  },
);

Message.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });
Message.belongsTo(User, { as: 'receiver', foreignKey: 'receiverId' });

export default Message;
