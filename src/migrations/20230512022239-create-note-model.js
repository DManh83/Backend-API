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
        'note',
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
          title: {
            type: Sequelize.STRING(),
          },
          content: {
            type: Sequelize.TEXT('tiny'),
            allowNull: false,
          },
          isPinned: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false,
            field: 'is_pinned',
          },
          hasTag: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false,
            field: 'has_tag',
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
        CREATE OR REPLACE FUNCTION note__update ()
          RETURNS TRIGGER
          LANGUAGE plpgsql
          AS $$
        BEGIN
          UPDATE
            note
          SET
            deleted_at = NOW()
          WHERE
            OLD.is_deleted = FALSE
            AND NEW.is_deleted = TRUE
            AND id = NEW.id;
          UPDATE
            note
          SET
            deleted_at = NULL
          WHERE
            OLD.is_deleted = TRUE
            AND NEW.is_deleted = FALSE
            AND id = NEW.id;
          RETURN NULL;
        END;
        $$;
        
        DROP TRIGGER IF EXISTS trg_note__update ON "note";
        
        CREATE TRIGGER trg_note__update
          AFTER UPDATE ON "note"
          FOR EACH ROW
          EXECUTE PROCEDURE note__update ();
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
          DROP TRIGGER IF EXISTS trg_note__update ON "note";
          DROP FUNCTION IF EXISTS note__update();
          `,
        { transaction }
      );

      await queryInterface.dropTable('note');

      await transaction.commit();
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }
    }
  },
};
