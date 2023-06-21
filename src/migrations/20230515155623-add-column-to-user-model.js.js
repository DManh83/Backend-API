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
        queryInterface.addColumn('user', 'birthday', { type: Sequelize.DATE }, { transaction }),
        queryInterface.addColumn('user', 'sex', { type: Sequelize.ENUM('male', 'female') }, { transaction }),
        queryInterface.addColumn('user', 'work_phone', { type: Sequelize.STRING(20) }, { transaction }),
        queryInterface.addColumn('user', 'street_address', { type: Sequelize.STRING() }, { transaction }),
        queryInterface.addColumn('user', 'city_town', { type: Sequelize.STRING() }, { transaction }),
        queryInterface.addColumn('user', 'state_province', { type: Sequelize.STRING() }, { transaction }),
        queryInterface.addColumn('user', 'postal_code', { type: Sequelize.STRING() }, { transaction }),
        queryInterface.addColumn('user', 'avatar', { type: Sequelize.STRING() }, { transaction }),
        queryInterface.addColumn('user', 'session_expire', { type: Sequelize.ENUM('4h', '8h') }, { transaction }),
        queryInterface.addColumn('user', 'password_update_at', { type: Sequelize.DATE }, { transaction }),
        queryInterface.addColumn(
          'user',
          'check_ups_notify',
          {
            type: Sequelize.BOOLEAN,
          },
          { transaction }
        ),
        queryInterface.addColumn(
          'user',
          'immunizations_notify',
          {
            type: Sequelize.BOOLEAN,
          },
          { transaction }
        ),
        queryInterface.addColumn(
          'user',
          'vaccinations_notify',
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
    await Promise.all([
      queryInterface.removeColumn('user', 'birthday'),
      queryInterface.removeColumn('user', 'sex'),
      queryInterface.removeColumn('user', 'work_phone'),
      queryInterface.removeColumn('user', 'street_address'),
      queryInterface.removeColumn('user', 'city_town'),
      queryInterface.removeColumn('user', 'state_province'),
      queryInterface.removeColumn('user', 'postal_code'),
      queryInterface.removeColumn('user', 'avatar'),
      queryInterface.removeColumn('user', 'session_expire'),
      queryInterface.removeColumn('user', 'password_update_at'),
      queryInterface.removeColumn('user', 'check_ups_notify'),
      queryInterface.removeColumn('user', 'immunizations_notify'),
      queryInterface.removeColumn('user', 'vaccinations_notify'),
    ]);
  },
};
