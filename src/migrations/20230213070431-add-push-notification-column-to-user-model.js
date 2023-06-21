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
          'immunizations_push_notify',
          {
            defaultValue: true,
            type: Sequelize.BOOLEAN,
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
        queryInterface.removeColumn('user', 'check_ups_push_notify'),
        queryInterface.removeColumn('user', 'immunizations_push_notify'),
      ]);

      await transaction.commit();
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }
    }
  },
};
