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
        'immunization_antigen',
        {
          id: {
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4,
          },
          immunizationId: {
            type: Sequelize.UUID,
            references: {
              model: {
                tableName: 'immunization',
              },
              key: 'id',
            },
            allowNull: false,
            field: 'immunization_id',
            onDelete: 'CASCADE',
          },
          antigenId: {
            type: Sequelize.UUID,
            references: {
              model: {
                tableName: 'antigen',
              },
              key: 'id',
            },
            allowNull: false,
            field: 'antigen_id',
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
        CREATE OR REPLACE FUNCTION immunization_antigen__delete ()
          RETURNS TRIGGER
          LANGUAGE plpgsql
          AS $$
        BEGIN
          DELETE FROM antigen
          WHERE id = OLD.antigen_id AND user_id IS NOT NULL
            AND(
              SELECT
                COUNT(antigen_id)
                FROM immunization_antigen
              WHERE
                antigen_id = OLD.antigen_id) = 0;
          RETURN NULL;
        END;
        $$;

        DROP TRIGGER IF EXISTS trg_immunization_antigen__delete ON "immunization_antigen";

        CREATE TRIGGER trg_immunization_antigen__delete
          AFTER DELETE ON "immunization_antigen"
          FOR EACH ROW
          EXECUTE PROCEDURE immunization_antigen__delete ();
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

      await queryInterface.dropTable('immunization_antigen', { transaction });
      await transaction.commit();
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }
    }
  },
};
