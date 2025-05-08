import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const UserLike = sequelize.define(
  'UserLike',
  {
    fromUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    toUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['fromUserId', 'toUserId'],
      },
    ],
  },
);

export default UserLike;
