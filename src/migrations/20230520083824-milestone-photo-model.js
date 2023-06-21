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
        'milestone_photo',
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
          milestoneId: {
            type: Sequelize.UUID,
            references: {
              model: {
                tableName: 'milestone',
              },
              key: 'id',
            },
            field: 'milestone_id',
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
          milestoneAlbumId: {
            type: Sequelize.UUID,
            references: {
              model: {
                tableName: 'milestone_album',
              },
              key: 'id',
            },
            field: 'milestone_album_id',
            onDelete: 'CASCADE',
          },
          photo: {
            type: Sequelize.STRING(200),
          },
          caption: {
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
        },
        { transaction }
      );

      await queryInterface.sequelize.query(
        `
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

        DROP TRIGGER IF EXISTS trg_milestone_photo__update ON "milestone_photo";

        CREATE TRIGGER trg_milestone_photo__update
          AFTER UPDATE ON "milestone_photo"
          FOR EACH ROW
          EXECUTE PROCEDURE milestone_photo__update ();

        CREATE OR REPLACE FUNCTION milestone_album__update ()
          RETURNS TRIGGER
          LANGUAGE plpgsql
          AS $$
        BEGIN
          UPDATE
            milestone_album
          SET
            is_deleted = TRUE
          WHERE
            OLD.total_photo = 1
            AND NEW.total_photo = 0
            AND id = NEW.id;
        UPDATE
          milestone_album
        SET
          is_deleted = FALSE
        WHERE
          OLD.total_photo = 0
          AND NEW.total_photo = 1
          AND id = NEW.id;
        RETURN NULL;
        END;
        $$;

        DROP TRIGGER IF EXISTS trg_milestone_album__update ON "milestone_album";

        CREATE TRIGGER trg_milestone_album__update
          AFTER UPDATE ON "milestone_album"
          FOR EACH ROW
          EXECUTE PROCEDURE milestone_album__update ();

        CREATE OR REPLACE FUNCTION milestone__update ()
          RETURNS TRIGGER
          LANGUAGE plpgsql
          AS $$
        BEGIN
          UPDATE
            milestone
          SET
            is_deleted = TRUE
          WHERE
            OLD.total_photo = 1
            AND NEW.total_photo = 0
            AND id = NEW.id;
          UPDATE
            milestone
          SET
            is_deleted = FALSE
          WHERE
            OLD.total_photo = 0
            AND NEW.total_photo = 1
            AND id = NEW.id;
          UPDATE
            milestone_album
          SET
            total_milestone = total_milestone + 1
          WHERE
            OLD.is_deleted = TRUE
            AND NEW.is_deleted = FALSE
            AND id = NEW.album_id;
          UPDATE
            milestone_album
          SET
            total_milestone = total_milestone - 1
          WHERE
            OLD.is_deleted = FALSE
            AND NEW.is_deleted = TRUE
            AND id = NEW.album_id;
          RETURN NULL;
        END;
        $$;
        
        DROP TRIGGER IF EXISTS trg_milestone__update ON "milestone";
        
        CREATE TRIGGER trg_milestone__update
          AFTER UPDATE ON "milestone"
          FOR EACH ROW
          EXECUTE PROCEDURE milestone__update ();

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

        DROP TRIGGER IF EXISTS trg_milestone_photo__delete ON "milestone_photo";

        CREATE TRIGGER trg_milestone_photo__delete
          AFTER DELETE ON "milestone_photo"
          FOR EACH ROW
          EXECUTE PROCEDURE milestone_photo__delete ();
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
         DROP TRIGGER IF EXISTS trg_milestone_photo__update ON "milestone_photo";
         DROP FUNCTION IF EXISTS milestone_photo__update();
         DROP TRIGGER IF EXISTS trg_milestone_album__update ON "milestone_album";
         DROP FUNCTION IF EXISTS milestone_album__update();
         DROP TRIGGER IF EXISTS trg_milestone__update ON "milestone";
         DROP FUNCTION IF EXISTS milestone__update();
         DROP TRIGGER IF EXISTS trg_milestone_photo__delete ON "milestone_photo";
         DROP FUNCTION IF EXISTS milestone_photo__delete();
         `,
        { transaction }
      );
      await queryInterface.dropTable('milestone_photo', { transaction });
      await transaction.commit();
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }
    }
  },
};
