module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable('milestone_standard_behavior', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      groupId: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'milestone_standard_group',
          },
          key: 'id',
        },
        allowNull: false,
        field: 'group_id',
        onDelete: 'CASCADE',
      },
      ageId: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'milestone_standard_age',
          },
          key: 'id',
        },
        allowNull: false,
        field: 'age_id',
        onDelete: 'CASCADE',
      },
      behavior: {
        type: Sequelize.STRING(),
        allowNull: false,
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
    await queryInterface.dropTable('milestone_standard_behavior');
  },
};
