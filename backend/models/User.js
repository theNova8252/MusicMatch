import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

class User extends Model {}

User.init(
  {
    name: DataTypes.STRING,
    email: { type: DataTypes.STRING, unique: true },
    spotifyToken: DataTypes.STRING(2048),
    spotifyRefreshToken: {
      type: DataTypes.STRING,
    },
    googleToken: DataTypes.STRING(2048),
    profileImage: DataTypes.STRING,
    artists: DataTypes.JSONB,
    isNewUser: { type: DataTypes.BOOLEAN, defaultValue: true },
    favoriteArtists: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    favoriteGenres: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'User',
  },
);

export default User;
