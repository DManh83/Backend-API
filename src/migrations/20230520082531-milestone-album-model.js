module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    await queryInterface.createTable('milestone_album', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      userId: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'user',
          },
          key: 'id',
        },
        allowNull: false,
        field: 'user_id',
        onDelete: 'CASCADE',
      },
      babyBookId: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'baby_book',
          },
          key: 'id',
        },
        allowNull: false,
        field: 'baby_book_id',
        onDelete: 'CASCADE',
      },
      isStandard: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        field: 'is_standard',
      },
      name: {
        type: Sequelize.STRING(),
        allowNull: false,
      },
      thumbnail: {
        type: Sequelize.STRING(200),
      },
      isDeleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        field: 'is_deleted',
      },
      totalMilestone: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
        field: 'total_milestone',
      },
      totalPhoto: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
        field: 'total_photo',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        field: 'created_at',
        defaultValue: Sequelize.fn('NOW'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        field: 'updated_at',
        defaultValue: Sequelize.fn('NOW'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable('milestone_album');
  },
};
