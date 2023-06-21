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
        queryInterface.addColumn('check_up_version', 'is_released', {
          type: Sequelize.BOOLEAN,
        }),
        queryInterface.addColumn('check_up_version', 'year', { type: Sequelize.INTEGER() }),
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
    await Promise.all([
      queryInterface.removeColumn('check_up_version', 'is_released'),
      queryInterface.removeColumn('check_up_version', 'year'),
    ]);
  },
};
