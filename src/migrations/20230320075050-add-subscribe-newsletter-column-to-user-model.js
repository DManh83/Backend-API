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

      await queryInterface.addColumn('user', 'subscribe_newsletter', {
        defaultValue: true,
        type: Sequelize.BOOLEAN,
        allowNull: false,
      });

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
      await queryInterface.removeColumn('user', 'subscribe_newsletter');
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }
    }
  },
};
