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

      await queryInterface.removeColumn('user', 'session_expire', { transaction });
      await queryInterface.addColumn('user', 'session_expire', { type: Sequelize.INTEGER }, { transaction });

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
    await queryInterface.removeColumn('user', 'session_expire', { type: Sequelize.INTEGER });
    await queryInterface.addColumn('user', 'session_expire', { type: Sequelize.ENUM('4h', '8h') });
  },
};
