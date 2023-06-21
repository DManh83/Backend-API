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
        'check_up_schedule',
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
            field: 'baby_book_id',
            allowNull: false,
            onDelete: 'CASCADE',
          },
          checkUpVersionId: {
            type: Sequelize.UUID,
            references: {
              model: {
                tableName: 'check_up_version',
              },
              key: 'id',
            },
            field: 'check_up_version_id',
            onDelete: 'CASCADE',
            allowNull: false,
          },
          checkUpId: {
            type: Sequelize.UUID,
            references: {
              model: {
                tableName: 'check_up',
              },
              key: 'id',
            },
            field: 'check_up_id',
            onDelete: 'CASCADE',
            allowNull: false,
          },
          status: {
            type: Sequelize.STRING(),
          },
          isSuggested: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false,
            field: 'is_suggested',
          },
          dateDue: {
            type: Sequelize.DATE,
            field: 'date_due',
          },
          dateDone: {
            type: Sequelize.DATE,
            field: 'date_done',
          },
          totalFile: {
            type: Sequelize.INTEGER(),
            allowNull: false,
            defaultValue: 0,
            field: 'total_file',
          },
          notifyAt: {
            type: Sequelize.DATE,
            field: 'notify_at',
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

      await queryInterface.dropTable('check_up_schedule', { transaction });
      await transaction.commit();
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }
    }
  },
};
