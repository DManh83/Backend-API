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
        'immunization',
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
          vaccinationId: {
            type: Sequelize.UUID,
            references: {
              model: {
                tableName: 'vaccination',
              },
              key: 'id',
            },
            field: 'vaccination_id',
            onDelete: 'CASCADE',
            allowNull: false,
          },
          antigen: {
            type: Sequelize.STRING(),
          },
          isSuggested: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false,
            field: 'is_suggested',
          },
          monthOld: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false,
            field: 'month_old',
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
        CREATE OR REPLACE FUNCTION immunization__delete ()
          RETURNS TRIGGER
          LANGUAGE plpgsql
          AS $$
        BEGIN
          UPDATE
            vaccination
          SET
            total_immunization = total_immunization - 1
          WHERE total_immunization > 0 AND id = OLD.vaccination_id;
        RETURN NULL;
        END;
        $$;

        DROP TRIGGER IF EXISTS trg_immunization__delete ON "immunization";

        CREATE TRIGGER trg_immunization__delete
          AFTER DELETE ON "immunization"
          FOR EACH ROW
          EXECUTE PROCEDURE immunization__delete ();

          CREATE OR REPLACE FUNCTION immunization__insert ()
          RETURNS TRIGGER
          LANGUAGE plpgsql
          AS $$
        BEGIN
          UPDATE
            vaccination
          SET
            total_immunization = total_immunization + 1
          WHERE
            id = NEW.vaccination_id;
          RETURN NULL;
        END;
        $$;
        
        DROP TRIGGER IF EXISTS trg_immunization__insert ON "immunization";
        
        CREATE TRIGGER trg_immunization__insert
          AFTER INSERT ON "immunization"
          FOR EACH ROW
          EXECUTE PROCEDURE immunization__insert ();
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
          DROP TRIGGER IF EXISTS trg_immunization__delete ON "immunization";
          DROP TRIGGER IF EXISTS trg_immunization__insert ON "immunization";
          DROP FUNCTION IF EXISTS immunization__delete();
          DROP FUNCTION IF EXISTS immunization__insert();
          `,
        { transaction }
      );
      await queryInterface.dropTable('immunization', { transaction });
      await transaction.commit();
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }
    }
  },
};
