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
        queryInterface.addColumn('baby_book', 'indigenous', { type: Sequelize.BOOLEAN }, { transaction }),
        queryInterface.addColumn('baby_book', 'medical_condition', { type: Sequelize.BOOLEAN }, { transaction }),
        queryInterface.addColumn('vaccination', 'indigenous', { type: Sequelize.BOOLEAN }, { transaction }),
        queryInterface.addColumn('vaccination', 'medical_condition', { type: Sequelize.BOOLEAN }, { transaction }),
        queryInterface.addColumn('vaccination', 'country', { type: Sequelize.STRING() }, { transaction }),
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
        queryInterface.removeColumn('baby_book', 'indigenous'),
        queryInterface.removeColumn('baby_book', 'medical_condition'),
        queryInterface.removeColumn('vaccination', 'indigenous'),
        queryInterface.removeColumn('vaccination', 'medical_condition'),
        queryInterface.removeColumn('vaccination', 'country'),
      ]);

      await transaction.commit();
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }
    }
  },
};
