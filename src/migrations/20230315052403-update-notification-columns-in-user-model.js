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

      await Promise.all([
        queryInterface.addColumn(
          'user',
          'push_notify',
          {
            defaultValue: true,
            type: Sequelize.BOOLEAN,
            allowNull: false,
          },
          { transaction }
        ),
        queryInterface.addColumn(
          'user',
          'receive_mail',
          {
            defaultValue: true,
            type: Sequelize.BOOLEAN,
            allowNull: false,
          },
          { transaction }
        ),
        queryInterface.addColumn(
          'user',
          'custom_immunizations_notify',
          {
            defaultValue: true,
            type: Sequelize.BOOLEAN,
            allowNull: false,
          },
          { transaction }
        ),
        queryInterface.addColumn(
          'user',
          'custom_check_ups_notify',
          {
            defaultValue: true,
            type: Sequelize.BOOLEAN,
            allowNull: false,
          },
          { transaction }
        ),
        queryInterface.removeColumn('user', 'immunizations_push_notify', { transaction }),
        queryInterface.removeColumn('user', 'check_ups_push_notify', { transaction }),
        queryInterface.removeColumn('user', 'receive_email_immunization_notify', { transaction }),
        queryInterface.removeColumn('user', 'receive_email_checks_up_notify', { transaction }),
        queryInterface.removeColumn('user', 'growth_chart_notify', { transaction }),
        queryInterface.removeColumn('user', 'note_notify', { transaction }),
        queryInterface.removeColumn('user', 'health_notify', { transaction }),
        queryInterface.removeColumn('user', 'milestone_notify', { transaction }),
        queryInterface.removeColumn('user', 'vaccinations_notify', { transaction }),
      ]);
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
      await Promise.all([
        queryInterface.removeColumn('user', 'push_notify', { transaction }),
        queryInterface.removeColumn('user', 'receive_mail', { transaction }),
        queryInterface.removeColumn('user', 'custom_immunizations_notify', { transaction }),
        queryInterface.removeColumn('user', 'custom_check_ups_notify', { transaction }),
        queryInterface.addColumn(
          'user',
          'immunizations_push_notify',
          {
            defaultValue: true,
            type: Sequelize.BOOLEAN,
            allowNull: false,
          },
          { transaction }
        ),
        queryInterface.addColumn(
          'user',
          'check_ups_push_notify',
          {
            defaultValue: true,
            type: Sequelize.BOOLEAN,
            allowNull: false,
          },
          { transaction }
        ),
        queryInterface.addColumn(
          'user',
          'receive_email_immunization_notify',
          {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
            allowNull: false,
          },
          { transaction }
        ),
        queryInterface.addColumn(
          'user',
          'receive_email_checks_up_notify',
          {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
            allowNull: false,
          },
          { transaction }
        ),
        queryInterface.addColumn(
          'user',
          'growth_chart_notify',
          {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
            allowNull: false,
          },
          { transaction }
        ),
        queryInterface.addColumn(
          'user',
          'note_notify',
          {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
            allowNull: false,
          },
          { transaction }
        ),
        queryInterface.addColumn(
          'user',
          'health_notify',
          {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
            allowNull: false,
          },
          { transaction }
        ),
        queryInterface.addColumn(
          'user',
          'milestone_notify',
          {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
            allowNull: false,
          },
          { transaction }
        ),
        queryInterface.addColumn(
          'user',
          'vaccinations_notify',
          {
            type: Sequelize.BOOLEAN,
          },
          { transaction }
        ),
      ]);

      await transaction.commit();
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }
    }
  },
};
