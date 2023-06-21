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
        queryInterface.addColumn('user', 'role', {
          type: Sequelize.ENUM('admin', 'editor', 'member'),
          defaultValue: 'member',
          allowNull: false,
        }),
        queryInterface.addColumn('user', 'total_baby_book', { type: Sequelize.INTEGER, defaultValue: 0, allowNull: false }),
      ]);

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
        END;
        $$;

        DROP TRIGGER IF EXISTS trg_baby_book__delete ON "baby_book";

        CREATE TRIGGER trg_baby_book__delete
          AFTER DELETE ON "baby_book"
          FOR EACH ROW
          EXECUTE PROCEDURE baby_book__delete ();

        CREATE OR REPLACE FUNCTION baby_book__create ()
          RETURNS TRIGGER
          LANGUAGE plpgsql
          AS $$
        BEGIN
          UPDATE
            "user"
          SET
            total_baby_book = total_baby_book + 1
          WHERE
            id = NEW.user_id;

          INSERT INTO "general_information" (id, user_id, baby_book_id, birthday)
            VALUES(gen_random_uuid (), NEW.user_id, NEW.id, NEW.birthday);
          RETURN NEW;
        END;
        $$;
        DROP TRIGGER IF EXISTS trg_baby_book__create ON "baby_book";

        CREATE TRIGGER trg_baby_book__create
          AFTER INSERT ON "baby_book"
          FOR EACH ROW
          EXECUTE PROCEDURE baby_book__create ();

        CREATE OR REPLACE FUNCTION milestone_standard_behavior__delete ()
          RETURNS TRIGGER
          LANGUAGE plpgsql
          AS $$
        BEGIN
          DELETE FROM milestone_standard_group
          WHERE id = OLD.group_id
            AND(
              SELECT
                COUNT(group_id)
                FROM milestone_standard_behavior
              WHERE
                group_id = OLD.group_id) = 0;
        DELETE FROM milestone_standard_age
        WHERE id = OLD.age_id
          AND(
            SELECT
              COUNT(age_id)
              FROM milestone_standard_behavior
            WHERE
              age_id = OLD.age_id) = 0;
        RETURN NULL;
        END;
        $$;
        
        DROP TRIGGER IF EXISTS trg_milestone_standard_behavior__delete ON "milestone_standard_behavior";
        
        CREATE TRIGGER trg_milestone_standard_behavior__delete
          AFTER DELETE ON "milestone_standard_behavior"
          FOR EACH ROW
          EXECUTE PROCEDURE milestone_standard_behavior__delete ();
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
    await Promise.all([queryInterface.removeColumn('user', 'role'), queryInterface.removeColumn('user', 'total_baby_book')]);
  },
};
