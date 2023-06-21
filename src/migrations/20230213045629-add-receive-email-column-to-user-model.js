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
          'receive_email_immunization_notify',
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
        queryInterface.removeColumn('user', 'receive_email_checks_up_notify'),
        queryInterface.removeColumn('user', 'receive_email_immunization_notify'),
      ]);

      await transaction.commit();
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }
    }
  },
};
