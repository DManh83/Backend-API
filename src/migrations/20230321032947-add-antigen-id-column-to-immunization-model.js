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
          'immunization',
          'antigen_id',
          {
            type: Sequelize.UUID,
            references: {
              model: {
                tableName: 'antigen',
              },
              key: 'id',
            },
            field: 'antigen_id',
            onDelete: 'CASCADE',
          },
          { transaction }
        ),
        queryInterface.removeColumn('immunization', 'antigen', { transaction }),
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
        queryInterface.removeColumn('immunization', 'antigen_id', { transaction }),
        queryInterface.addColumn(
          'immunization',
          'antigen',
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
};
