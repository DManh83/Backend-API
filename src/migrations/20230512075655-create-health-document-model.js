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
        'health_document',
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
          healthFolderId: {
            type: Sequelize.UUID,
            references: {
              model: {
                tableName: 'health_folder',
              },
              key: 'id',
            },
            field: 'health_folder_id',
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
        CREATE OR REPLACE FUNCTION health_document__update ()
          RETURNS TRIGGER
          LANGUAGE plpgsql
          AS $$
        BEGIN
          UPDATE
            health_folder
          SET
            total_document = total_document + 1
          WHERE ((OLD.is_deleted = TRUE
              AND NEW.is_deleted = FALSE)
            OR(OLD.health_folder_id IS NULL
              AND NEW.health_folder_id IS NOT NULL))
          AND id = NEW.health_folder_id;
          UPDATE
            health_folder
          SET
            total_document = total_document - 1
          WHERE ((OLD.is_deleted = FALSE
              AND NEW.is_deleted = TRUE)
            OR(OLD.health_folder_id IS NOT NULL
              AND NEW.health_folder_id IS NULL))
          AND total_document >= 0
          AND id = OLD.health_folder_id;
          UPDATE
            health_document
          SET
            deleted_at = NOW ()
          WHERE
            OLD.is_deleted = FALSE
            AND NEW.is_deleted = TRUE
            AND id = NEW.id;
          UPDATE
            health_document
          SET
            deleted_at = NULL
          WHERE
            OLD.is_deleted = TRUE
            AND NEW.is_deleted = FALSE
            AND id = NEW.id;
          RETURN NULL;
        END;
        $$;
        
        DROP TRIGGER IF EXISTS trg_health_document__update ON "health_document";
        
        CREATE TRIGGER trg_health_document__update
          AFTER UPDATE ON "health_document"
          FOR EACH ROW
          EXECUTE PROCEDURE health_document__update ();

        CREATE OR REPLACE FUNCTION health_folder__update ()
          RETURNS TRIGGER
          LANGUAGE plpgsql
          AS $$
        BEGIN
          UPDATE
            health_folder
          SET
            is_deleted = TRUE,
            deleted_at = NOW ()
          WHERE
            OLD.total_document = 1
            AND NEW.total_document = 0
            AND id = NEW.id;
          UPDATE
            health_folder
          SET
            is_deleted = FALSE,
            deleted_at = NULL
          WHERE
            OLD.total_document = 0
            AND NEW.total_document = 1
            AND id = NEW.id;
          RETURN NULL;
        END;
        $$;

        DROP TRIGGER IF EXISTS trg_health_folder__update ON "health_folder";

        CREATE TRIGGER trg_health_folder__update
          AFTER UPDATE ON "health_folder"
          FOR EACH ROW
          EXECUTE PROCEDURE health_folder__update ();
        
        CREATE OR REPLACE FUNCTION health_document__delete ()
          RETURNS TRIGGER
          LANGUAGE plpgsql
          AS $$
        BEGIN
          DELETE FROM health_folder
          WHERE id = OLD.health_folder_id
            AND(
              SELECT
                count(health_folder_id)
                FROM health_document
              WHERE
                health_folder_id = OLD.health_folder_id) = 0;
        RETURN NULL;
        END;
        $$;

        DROP TRIGGER IF EXISTS trg_health_document__delete ON "health_document";

        CREATE TRIGGER trg_health_document__delete
          AFTER DELETE ON "health_document"
          FOR EACH ROW
          EXECUTE PROCEDURE health_document__delete ();
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
          DROP TRIGGER IF EXISTS trg_health_document__update ON "health_document";
          DROP TRIGGER IF EXISTS trg_health_folder__update ON "health_folder";
          DROP TRIGGER IF EXISTS trg_health_document__delete ON "health_document";
          DROP FUNCTION IF EXISTS health_document__update();
          DROP FUNCTION IF EXISTS health_folder__update();
          DROP FUNCTION IF EXISTS health_document__delete();
          `,
        { transaction }
      );
      await queryInterface.dropTable('health_document', { transaction });
      await transaction.commit();
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }
    }
  },
};
