module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    let transaction;
    try {
      transaction = await queryInterface.sequelize.transaction();
      await queryInterface.createTable(
        'user_check_up_version',
        {
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
            field: 'user_id',
            onDelete: 'CASCADE',
            allowNull: false,
          },
          checkUpVersionId: {
            type: Sequelize.UUID,
            references: {
              model: {
                tableName: 'check_up_version',
              },
              key: 'id',
            },
            allowNull: false,
            field: 'check_up_version_id',
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
          isDeleted: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false,
            field: 'is_deleted',
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
        },
        { transaction }
      );
      await transaction.commit();
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }
    }
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    let transaction;
    try {
      transaction = await queryInterface.sequelize.transaction();

      await queryInterface.dropTable('user_check_up_version', { transaction });
      await transaction.commit();
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }
    }
  },
};
