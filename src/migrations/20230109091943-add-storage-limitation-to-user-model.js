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
        queryInterface.addColumn('user', 'used_storage', { type: Sequelize.INTEGER, defaultValue: 0, allowNull: false }, { transaction }),
        ...['check_up_file', 'health_document', 'milestone_photo'].map((table) =>
          queryInterface.addColumn(table, 'file_size', { type: Sequelize.INTEGER, defaultValue: 0, allowNull: false }, { transaction })
        ),
        queryInterface.sequelize.query(
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
              "user"
            SET
              used_storage = used_storage + NEW.file_size
            WHERE ((OLD.is_deleted = TRUE
                AND NEW.is_deleted = FALSE)
              OR(OLD.health_folder_id IS NULL
                AND NEW.health_folder_id IS NOT NULL))
            AND id = NEW.user_id;
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
              deleted_at = NOW()
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
            UPDATE
              "user"
            SET
              used_storage = used_storage - OLD.file_size
            WHERE
              id = OLD.user_id
              AND used_storage >= OLD.file_size;
            RETURN NULL;
          END;
          $$;

          CREATE OR REPLACE FUNCTION milestone_photo__update ()
            RETURNS TRIGGER
            LANGUAGE plpgsql
            AS $$
          BEGIN
            UPDATE
              "user"
            SET
              used_storage = used_storage + NEW.file_size
            WHERE ((OLD.is_deleted = TRUE
                AND NEW.is_deleted = FALSE)
              OR(OLD.milestone_album_id IS NULL
                AND NEW.milestone_album_id IS NOT NULL))
            AND id = NEW.user_id;
            UPDATE
              milestone_album
            SET
              total_photo = total_photo + 1
            WHERE ((OLD.is_deleted = TRUE
                AND NEW.is_deleted = FALSE)
              OR(OLD.milestone_album_id IS NULL
                AND NEW.milestone_album_id IS NOT NULL))
            AND milestone_album.id = NEW.milestone_album_id;
            UPDATE
              milestone_album
            SET
              total_photo = total_photo - 1
            WHERE ((OLD.is_deleted = FALSE
                AND NEW.is_deleted = TRUE)
              OR(OLD.milestone_album_id IS NOT NULL
                AND NEW.milestone_album_id IS NULL))
            AND milestone_album.total_photo >= 0
            AND milestone_album.id = OLD.milestone_album_id;
            UPDATE
              milestone
            SET
              total_photo = total_photo + 1
            WHERE ((OLD.is_deleted = TRUE
                AND NEW.is_deleted = FALSE)
              OR(OLD.milestone_id IS NULL
                AND NEW.milestone_id IS NOT NULL))
            AND id = NEW.milestone_id;
            UPDATE
              milestone
            SET
              total_photo = total_photo - 1
            WHERE ((OLD.is_deleted = FALSE
                AND NEW.is_deleted = TRUE)
              OR(OLD.milestone_id IS NOT NULL
                AND NEW.milestone_id IS NULL))
            AND total_photo >= 0
            AND id = OLD.milestone_id;
            RETURN NULL;
          END;
          $$;

          CREATE OR REPLACE FUNCTION milestone_photo__delete ()
            RETURNS TRIGGER
            LANGUAGE plpgsql
            AS $$
          BEGIN
            DELETE FROM milestone_album
            WHERE id = OLD.milestone_album_id
              AND(
                SELECT
                  count(milestone_album_id)
                  FROM milestone_photo
                WHERE
                  milestone_album_id = OLD.milestone_album_id) = 0;
            UPDATE
              "user"
            SET
              used_storage = used_storage - OLD.file_size
            WHERE
              id = OLD.user_id
              AND used_storage >= OLD.file_size;
            RETURN NULL;
          END;
          $$;

          CREATE OR REPLACE FUNCTION check_up_file__update ()
            RETURNS TRIGGER
            LANGUAGE plpgsql
            AS $$
          BEGIN
            UPDATE
              "user"
            SET
              used_storage = used_storage + NEW.file_size
            WHERE
              OLD.is_deleted = TRUE
              AND NEW.is_deleted = FALSE
              AND id = NEW.user_id;
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

          CREATE OR REPLACE FUNCTION check_up_file__delete ()
            RETURNS TRIGGER
            LANGUAGE plpgsql
            AS $$
          BEGIN
            UPDATE
              "user"
            SET
              used_storage = used_storage - OLD.file_size
            WHERE
              id = OLD.user_id
              AND used_storage >= OLD.file_size;
            RETURN NULL;
          END;
          $$;

          DROP TRIGGER IF EXISTS trg_check_up_file__delete ON "check_up_file";

          CREATE TRIGGER trg_check_up_file__delete
            AFTER DELETE ON "check_up_file"
            FOR EACH ROW
            EXECUTE PROCEDURE check_up_file__delete ();
          `,
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

    let transaction;

    try {
      transaction = await queryInterface.sequelize.transaction();

      await Promise.all([
        queryInterface.removeColumn('user', 'used_storage'),
        ...['check_up_file', 'health_document', 'milestone_photo'].map((table) =>
          queryInterface.removeColumn(table, 'file_size', { transaction })
        ),
        queryInterface.sequelize.query(
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

          CREATE OR REPLACE FUNCTION milestone_photo__update ()
            RETURNS TRIGGER
            LANGUAGE plpgsql
            AS $$
          BEGIN
            UPDATE
              milestone_album
            SET
              total_photo = total_photo + 1
            WHERE ((OLD.is_deleted = TRUE
                AND NEW.is_deleted = FALSE)
              OR(OLD.milestone_album_id IS NULL
                AND NEW.milestone_album_id IS NOT NULL))
            AND milestone_album.id = NEW.milestone_album_id;
            UPDATE
              milestone_album
            SET
              total_photo = total_photo - 1
            WHERE ((OLD.is_deleted = FALSE
                AND NEW.is_deleted = TRUE)
              OR(OLD.milestone_album_id IS NOT NULL
                AND NEW.milestone_album_id IS NULL))
            AND milestone_album.total_photo >= 0
            AND milestone_album.id = OLD.milestone_album_id;
            UPDATE
              milestone
            SET
              total_photo = total_photo + 1
            WHERE ((OLD.is_deleted = TRUE
                AND NEW.is_deleted = FALSE)
              OR(OLD.milestone_id IS NULL
                AND NEW.milestone_id IS NOT NULL))
            AND id = NEW.milestone_id;
            UPDATE
              milestone
            SET
              total_photo = total_photo - 1
            WHERE ((OLD.is_deleted = FALSE
                AND NEW.is_deleted = TRUE)
              OR(OLD.milestone_id IS NOT NULL
                AND NEW.milestone_id IS NULL))
            AND total_photo >= 0
            AND id = OLD.milestone_id;
            RETURN NULL;
          END;
          $$;
          
          CREATE OR REPLACE FUNCTION milestone_photo__delete ()
            RETURNS TRIGGER
            LANGUAGE plpgsql
            AS $$
          BEGIN
            DELETE FROM milestone_album
            WHERE id = OLD.milestone_album_id
              AND(
                SELECT
                  count(milestone_album_id)
                  FROM milestone_photo
                WHERE
                  milestone_album_id = OLD.milestone_album_id) = 0;
          RETURN NULL;
          END;
          $$;

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

          DROP TRIGGER IF EXISTS trg_check_up_file__delete ON "check_up_file";
          DROP FUNCTION IF EXISTS check_up_file__delete();
          `,
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
