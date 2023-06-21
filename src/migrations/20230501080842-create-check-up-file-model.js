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
        'check_up_file',
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
            allowNull: false,
            field: 'user_id',
            onDelete: 'CASCADE',
          },
          babyBookId: {
            type: Sequelize.UUID,
            references: {
              model: {
                tableName: 'baby_book',
              },
              key: 'id',
            },
            field: 'baby_book_id',
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
          },
          checkUpScheduleId: {
            type: Sequelize.UUID,
            references: {
              model: {
                tableName: 'check_up_schedule',
              },
              key: 'id',
            },
            field: 'check_up_schedule_id',
            onDelete: 'CASCADE',
          },
          filename: {
            type: Sequelize.STRING(),
          },
          pathname: {
            type: Sequelize.STRING(),
          },
          isDeleted: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false,
            field: 'is_deleted',
          },
          deletedAt: {
            type: Sequelize.DATE,
            field: 'deleted_at',
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
        },
        { transaction }
      );

      await queryInterface.sequelize.query(
        `
        CREATE OR REPLACE FUNCTION check_up_file__update ()
          RETURNS TRIGGER
          LANGUAGE plpgsql
          AS $$
        BEGIN
          UPDATE
            check_up_schedule
          SET
            total_file = total_file + 1
          WHERE
            OLD.is_deleted = TRUE
            AND NEW.is_deleted = FALSE
            AND id = NEW.check_up_schedule_id;
          UPDATE
            check_up_schedule
          SET
            total_file = total_file - 1
          WHERE
            OLD.is_deleted = FALSE
            AND NEW.is_deleted = TRUE
          AND total_file >= 0
          AND id = OLD.check_up_schedule_id;
          UPDATE
            check_up_file
          SET
            deleted_at = NOW()
          WHERE
            OLD.is_deleted = FALSE
            AND NEW.is_deleted = TRUE
            AND id = NEW.id;
          UPDATE
            check_up_file
          SET
            deleted_at = NULL
          WHERE
            OLD.is_deleted = TRUE
            AND NEW.is_deleted = FALSE
            AND id = NEW.id;
          RETURN NULL;
        END;
        $$;
        
        DROP TRIGGER IF EXISTS trg_check_up_file__update ON "check_up_file";
        
        CREATE TRIGGER trg_check_up_file__update
          AFTER UPDATE ON "check_up_file"
          FOR EACH ROW
          EXECUTE PROCEDURE check_up_file__update ();
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
          DROP TRIGGER IF EXISTS trg_check_up_file__update ON "check_up_file";
          DROP FUNCTION IF EXISTS check_up_file__update();
          `,
        { transaction }
      );
      await queryInterface.dropTable('check_up_file', { transaction });
      await transaction.commit();
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }
    }
  },
};
