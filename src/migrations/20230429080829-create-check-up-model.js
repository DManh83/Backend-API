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
      await queryInterface.createTable(
        'check_up',
        {
          id: {
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4,
          },
          userId: {
            type: Sequelize.UUID,
            references: {
              model: {
                tableName: 'user',
              },
              key: 'id',
            },
            field: 'user_id',
            onDelete: 'CASCADE',
          },
          checkUpVersionId: {
            type: Sequelize.UUID,
            references: {
              model: {
                tableName: 'check_up_version',
              },
              key: 'id',
            },
            field: 'check_up_version_id',
            onDelete: 'CASCADE',
            allowNull: false,
          },
          isSuggested: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false,
            field: 'is_suggested',
          },
          title: {
            type: Sequelize.STRING(),
            allowNull: false,
          },
          ageDue: {
            type: Sequelize.STRING(),
            field: 'age_due',
          },
          monthDue: {
            type: Sequelize.INTEGER(),
            field: 'month_due',
          },
          isDeleted: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false,
            field: 'is_deleted',
          },
          createdAt: {
            allowNull: false,
            type: Sequelize.DATE,
            field: 'created_at',
            defaultValue: Sequelize.fn('NOW'),
          },
          updatedAt: {
            allowNull: false,
            type: Sequelize.DATE,
            field: 'updated_at',
            defaultValue: Sequelize.fn('NOW'),
          },
          deletedAt: {
            type: Sequelize.DATE,
            field: 'deleted_at',
          },
        },
        { transaction }
      );

      await queryInterface.sequelize.query(
        `
        CREATE OR REPLACE FUNCTION check_up__delete ()
          RETURNS TRIGGER
          LANGUAGE plpgsql
          AS $$
        BEGIN
          UPDATE
            check_up_version
          SET
            total_check_up = total_check_up - 1
          WHERE
            total_check_up > 0
            AND id = OLD.check_up_version_id;
          RETURN NULL;
        END;
        $$;

        DROP TRIGGER IF EXISTS trg_check_up__delete ON "check_up";

        CREATE TRIGGER trg_check_up__delete
          AFTER DELETE ON "check_up"
          FOR EACH ROW
          EXECUTE PROCEDURE check_up__delete ();

        CREATE OR REPLACE FUNCTION check_up__insert ()
          RETURNS TRIGGER
          LANGUAGE plpgsql
          AS $$
        BEGIN
          UPDATE
            check_up_version
          SET
            total_check_up = total_check_up + 1
          WHERE
            id = NEW.check_up_version_id;
        RETURN NULL;
        END;
        $$;

        DROP TRIGGER IF EXISTS trg_check_up__insert ON "check_up";

        CREATE TRIGGER trg_check_up__insert
          AFTER INSERT ON "check_up"
          FOR EACH ROW
          EXECUTE PROCEDURE check_up__insert ();
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
          DROP TRIGGER IF EXISTS trg_check_up__delete ON "check_up";
          DROP TRIGGER IF EXISTS trg_check_up__insert ON "check_up";
          DROP FUNCTION IF EXISTS check_up__delete();
          DROP FUNCTION IF EXISTS check_up__insert();
          `,
        { transaction }
      );
      await queryInterface.dropTable('check_up', { transaction });
      await transaction.commit();
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }
    }
  },
};
