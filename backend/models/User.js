import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

class User extends Model {}

User.init(
  {
    name: DataTypes.STRING,
    email: { type: DataTypes.STRING, unique: true },
    spotifyToken: DataTypes.STRING(2048),
    googleToken: DataTypes.STRING(2048),
    profileImage: DataTypes.STRING,
    artists: DataTypes.JSONB,
    isNewUser: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    sequelize,
    modelName: 'User',
  },
);

export default User;
