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
        'immunization_schedule',
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
          vaccinationId: {
            type: Sequelize.UUID,
            references: {
              model: {
                tableName: 'vaccination',
              },
              key: 'id',
            },
            field: 'vaccination_id',
            onDelete: 'CASCADE',
            allowNull: false,
          },
          immunizationId: {
            type: Sequelize.UUID,
            references: {
              model: {
                tableName: 'immunization',
              },
              key: 'id',
            },
            field: 'immunization_id',
            onDelete: 'CASCADE',
            allowNull: false,
          },
          dateDue: {
            type: Sequelize.DATE,
            field: 'date_due',
            allowNull: false,
          },
          status: {
            type: Sequelize.STRING(),
            field: 'status',
          },
          batchNo: {
            type: Sequelize.STRING(),
            field: 'batch_no',
          },
          organization: {
            type: Sequelize.STRING(),
          },
          isSuggested: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false,
            field: 'is_suggested',
          },
          isCompleted: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false,
            field: 'is_completed',
          },
          dateDone: {
            type: Sequelize.DATE,
            field: 'date_done',
          },
          repeatShotAt: {
            type: Sequelize.DATE,
            field: 'repeat_shot_at',
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
          deletedAt: {
            type: Sequelize.DATE,
            field: 'deleted_at',
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

      await queryInterface.dropTable('immunization_schedule', { transaction });
      await transaction.commit();
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }
    }
  },
};
