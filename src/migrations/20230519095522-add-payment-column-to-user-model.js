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
        queryInterface.addColumn('user', 'stripe_customer_id', {
          type: Sequelize.STRING(),
        }),
        queryInterface.addColumn('user', 'payment_method', { type: Sequelize.JSONB }),
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
      await Promise.all([queryInterface.removeColumn('user', 'stripe_customer_id'), queryInterface.removeColumn('user', 'payment_method')]);

      await transaction.commit();
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }
    }
  },
};
