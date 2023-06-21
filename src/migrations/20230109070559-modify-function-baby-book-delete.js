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
      await queryInterface.sequelize.query(
        `
        CREATE OR REPLACE FUNCTION baby_book__delete ()
          RETURNS TRIGGER
          LANGUAGE plpgsql
          AS $$
        BEGIN
          UPDATE
            "user"
          SET
            total_baby_book = total_baby_book - 1
          WHERE
            id = OLD.user_id
            AND total_baby_book > 0;
          RETURN NULL;
        END;
        $$;
        `,
        { transaction }
      );

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
  },
};
