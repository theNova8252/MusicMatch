import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import Message from './Message.js';

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
    recentlyPlayed: {
      type: DataTypes.JSON, 
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'User',
  },
);
User.belongsToMany(User, {
  through: 'UserLike',
  as: 'LikedUsers',
  foreignKey: 'fromUserId',
  otherKey: 'toUserId',
});
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });
export default User;
