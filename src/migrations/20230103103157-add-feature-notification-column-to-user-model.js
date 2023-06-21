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
        queryInterface.removeColumn('user', 'check_ups_notify'),
        queryInterface.removeColumn('user', 'immunizations_notify'),
        queryInterface.removeColumn('user', 'vaccinations_notify'),
      ]);

      await Promise.all([
        queryInterface.addColumn(
          'user',
          'general_information_notify',
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
          'inactivity_notify',
          {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
            allowNull: false,
          },
          { transaction }
        ),
        queryInterface.addColumn(
          'user',
          'check_ups_notify',
          {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
            allowNull: false,
          },
          { transaction }
        ),
        queryInterface.addColumn(
          'user',
          'immunizations_notify',
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
            defaultValue: true,
            allowNull: false,
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
        queryInterface.removeColumn('user', 'general_information_notify'),
        queryInterface.removeColumn('user', 'milestone_notify'),
        queryInterface.removeColumn('user', 'health_notify'),
        queryInterface.removeColumn('user', 'note_notify'),
        queryInterface.removeColumn('user', 'growth_chart_notify'),
        queryInterface.removeColumn('user', 'inactivity_notify'),
      ]);

      await transaction.commit();
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }
    }
  },
};
