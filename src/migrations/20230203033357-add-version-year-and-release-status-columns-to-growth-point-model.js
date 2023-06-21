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
          'growth_point',
          'version_year',
          {
            type: Sequelize.INTEGER(),
          },
          { transaction }
        ),
        queryInterface.addColumn(
          'growth_point',
          'is_released',
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
        queryInterface.removeColumn('growth_point', 'version_year', { transaction }),
        queryInterface.removeColumn('growth_point', 'is_released', { transaction }),
      ]);

      await transaction.commit();
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }
    }
  },
};
