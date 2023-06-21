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
        'note_tag',
        {
          id: {
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4,
          },
          noteId: {
            type: Sequelize.UUID,
            references: {
              model: {
                tableName: 'note',
              },
              key: 'id',
            },
            allowNull: false,
            field: 'note_id',
            onDelete: 'CASCADE',
          },
          tagId: {
            type: Sequelize.UUID,
            references: {
              model: {
                tableName: 'tag',
              },
              key: 'id',
            },
            allowNull: false,
            field: 'tag_id',
            onDelete: 'CASCADE',
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
        CREATE OR REPLACE FUNCTION note_tag__delete ()
          RETURNS TRIGGER
          LANGUAGE plpgsql
          AS $$
        BEGIN
          UPDATE
            note
          SET
            has_tag = FALSE
          WHERE (
            SELECT
              count(tag_id)
            FROM
              note_tag
            WHERE
              note_id = OLD.note_id) = 0
            AND id = OLD.note_id;
          RETURN NULL;
        END;
        $$;

        DROP TRIGGER IF EXISTS trg_note_tag__delete ON "note_tag";

        CREATE TRIGGER trg_note_tag__delete
          AFTER DELETE ON "note_tag"
          FOR EACH ROW
          EXECUTE PROCEDURE note_tag__delete ();
        
        CREATE OR REPLACE FUNCTION note_tag__insert ()
          RETURNS TRIGGER
          LANGUAGE plpgsql
          AS $$
        BEGIN
          UPDATE
            note
          SET
            has_tag = TRUE
          WHERE
            id = NEW.note_id;
        RETURN NULL;
        END;
        $$;
        
        DROP TRIGGER IF EXISTS trg_note_tag__insert ON "note_tag";
        
        CREATE TRIGGER trg_note_tag__insert
          AFTER INSERT ON "note_tag"
          FOR EACH ROW
          EXECUTE PROCEDURE note_tag__insert ();
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
         DROP TRIGGER IF EXISTS trg_note_tag__delete ON "note_tag";
         DROP FUNCTION IF EXISTS note_tag__delete();
         DROP TRIGGER IF EXISTS trg_note_tag__insert ON "note_tag";
         DROP FUNCTION IF EXISTS note_tag__insert();
         `,
        { transaction }
      );
      await queryInterface.dropTable('note_tag', { transaction });
      await transaction.commit();
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }
    }
  },
};
