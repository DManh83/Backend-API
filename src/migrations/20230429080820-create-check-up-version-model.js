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
        'check_up_version',
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
          },
          babyBookId: {
            type: Sequelize.UUID,
            references: {
              model: {
                tableName: 'baby_book',
              },
              key: 'id',
            },
            field: 'baby_book_id',
            onDelete: 'CASCADE',
          },
          name: {
            type: Sequelize.STRING(),
          },
          mainColor: {
            type: Sequelize.STRING(),
            field: 'main_color',
          },
          subColor: {
            type: Sequelize.STRING(),
            field: 'sub_color',
          },
          isSuggested: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false,
            field: 'is_suggested',
          },
          totalCheckUp: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false,
            field: 'total_check_up',
          },
          isDeleted: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false,
            field: 'is_deleted',
          },
          deletedAt: {
            type: Sequelize.DATE,
            field: 'deleted_at',
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

      await queryInterface.dropTable('check_up_version', { transaction });
      await transaction.commit();
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }
    }
  },
};
