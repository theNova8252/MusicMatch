'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Users', 'spotifyToken', {
      type: Sequelize.STRING(2048), // Increased to 2048
      allowNull: true,
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Users', 'spotifyToken', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
  },
};
