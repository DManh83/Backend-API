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
        'tag',
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
          name: {
            type: Sequelize.STRING(),
            allowNull: false,
          },
          type: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false,
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
        CREATE OR REPLACE FUNCTION tag__update ()
          RETURNS TRIGGER
          LANGUAGE plpgsql
          AS $$
        BEGIN
          UPDATE
            tag
          SET
            deleted_at = NOW()
          WHERE
            OLD.is_deleted = FALSE
            AND NEW.is_deleted = TRUE
            AND id = NEW.id;
          UPDATE
            tag
          SET
            deleted_at = NULL
          WHERE
            OLD.is_deleted = TRUE
            AND NEW.is_deleted = FALSE
            AND id = NEW.id;
          RETURN NULL;
        END;
        $$;
        
        DROP TRIGGER IF EXISTS trg_tag__update ON "tag";
        
        CREATE TRIGGER trg_tag__update
          AFTER UPDATE ON "tag"
          FOR EACH ROW
          EXECUTE PROCEDURE tag__update ();
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
          DROP TRIGGER IF EXISTS trg_tag__update ON "tag";
          DROP FUNCTION IF EXISTS tag__update();
          `,
        { transaction }
      );
      await queryInterface.dropTable('tag', { transaction });
      await transaction.commit();
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }
    }
  },
};
