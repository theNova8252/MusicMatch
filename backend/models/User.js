import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

class User extends Model {}

User.init(
  {
    name: DataTypes.STRING,
    email: { type: DataTypes.STRING, unique: true },
    spotifyToken: DataTypes.STRING(2048),
    profileImage: DataTypes.STRING,
    artists: DataTypes.JSONB,
  },
  {
    sequelize,
    modelName: 'User',
  },
);

export default User;
