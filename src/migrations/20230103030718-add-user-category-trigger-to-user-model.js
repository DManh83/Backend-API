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
        CREATE OR REPLACE FUNCTION user__insert__category ()
          RETURNS TRIGGER
          LANGUAGE plpgsql
          AS $$
        BEGIN
          DECLARE ids uuid;
          BEGIN
          FOR ids IN SELECT id FROM category
	          LOOP
	          INSERT INTO "user_category" (id, user_id, category_id)
            VALUES (gen_random_uuid(), NEW.id, ids);
	          END LOOP;
          END;
          RETURN NEW;
        END;
        $$;

        DROP TRIGGER IF EXISTS trg_user__insert__category ON "user";

        CREATE TRIGGER trg_user__insert__category
          AFTER INSERT ON "user"
          FOR EACH ROW
          EXECUTE PROCEDURE user__insert__category ();
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
    let transaction;
    try {
      transaction = await queryInterface.sequelize.transaction();

      await queryInterface.sequelize.query(
        `
        DROP TRIGGER IF EXISTS trg_user__insert__category ON "user";
        DROP FUNCTION IF EXISTS user__insert__category();
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
};
