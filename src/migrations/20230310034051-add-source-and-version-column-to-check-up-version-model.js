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
          'check_up_version',
          'source',
          {
            type: Sequelize.STRING(),
          },
          { transaction }
        ),
        queryInterface.addColumn(
          'check_up_version',
          'version',
          {
            type: Sequelize.STRING(),
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
        queryInterface.removeColumn('check_up_version', 'source'),
        queryInterface.removeColumn('check_up_version', 'version'),
      ]);

      await transaction.commit();
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }
    }
  },
};
