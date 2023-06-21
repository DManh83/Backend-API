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
        'sharing_session',
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
          email: {
            type: Sequelize.STRING(),
            allowNull: false,
          },
          sharedAt: {
            type: Sequelize.DATE,
            field: 'shared_at',
          },
          availableAfter: {
            type: Sequelize.DATE,
            field: 'available_after',
          },
          totalBabyBook: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false,
            field: 'total_baby_book',
          },
          duration: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false,
          },
          expiredAfter: {
            type: Sequelize.DATE,
            field: 'expired_after',
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

      await queryInterface.dropTable('sharing_session');

      await transaction.commit();
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }
    }
  },
};
