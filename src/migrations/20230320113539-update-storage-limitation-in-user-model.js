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
        queryInterface.changeColumn(
          'user',
          'used_storage',
          {
            defaultValue: 0,
            type: Sequelize.BIGINT,
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
        queryInterface.changeColumn(
          'user',
          'used_storage',
          {
            defaultValue: 0,
            type: Sequelize.INTEGER,
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
};
