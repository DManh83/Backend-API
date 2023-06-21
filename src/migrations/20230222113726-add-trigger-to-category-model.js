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
        CREATE OR REPLACE FUNCTION category__insert ()
          RETURNS TRIGGER
          LANGUAGE plpgsql
          AS $$
        BEGIN
          DECLARE ids uuid;
          BEGIN
          FOR ids IN SELECT id FROM "user"
	          LOOP
	          INSERT INTO "user_category" (id, user_id, category_id)
            VALUES (gen_random_uuid(), ids, NEW.id);
	          END LOOP;
          END;
          RETURN NEW;
        END;
        $$;

        DROP TRIGGER IF EXISTS trg_category__insert ON "category";

        CREATE TRIGGER trg_category__insert
          AFTER INSERT ON "category"
          FOR EACH ROW
          EXECUTE PROCEDURE category__insert ();
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
        DROP TRIGGER IF EXISTS trg_category__insert ON "category";
        DROP FUNCTION IF EXISTS category__insert();
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
