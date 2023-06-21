module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    let transaction;

    try {
      transaction = await queryInterface.sequelize.transaction();

      await queryInterface.createTable('subscription', {
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
        subscriptionId: {
          type: Sequelize.STRING,
          field: 'subscription_id',
        },
        status: {
          type: Sequelize.ENUM('incomplete', 'incomplete_expired', 'trialing', 'active', 'past_due', 'canceled', 'unpaid'),
          allowNull: false,
        },
        currentPeriodStart: {
          allowNull: false,
          type: Sequelize.DATE,
          field: 'current_period_start',
        },
        currentPeriodEnd: {
          allowNull: false,
          type: Sequelize.DATE,
          field: 'current_period_end',
        },
        cancelAtPeriodEnd: {
          allowNull: false,
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          field: 'cancel_at_period_end',
        },
        record: {
          allowNull: false,
          type: Sequelize.JSONB,
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
      await transaction.commit();
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    let transaction;
    try {
      transaction = await queryInterface.sequelize.transaction();

      await queryInterface.dropTable('subscription');
      await transaction.commit();
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }
    }
  },
};
