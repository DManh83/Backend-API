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
        'milestone',
        {
          id: {
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4,
          },
          albumId: {
            type: Sequelize.UUID,
            references: {
              model: {
                tableName: 'milestone_album',
              },
              key: 'id',
            },
            allowNull: false,
            field: 'album_id',
            onDelete: 'CASCADE',
          },
          behaviorId: {
            type: Sequelize.UUID,
            references: {
              model: {
                tableName: 'milestone_standard_behavior',
              },
              key: 'id',
            },
            field: 'behavior_id',
            onDelete: 'CASCADE',
          },
          isDeleted: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false,
            field: 'is_deleted',
          },
          totalPhoto: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false,
            field: 'total_photo',
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
        {
          transaction,
        }
      );

      await queryInterface.sequelize.query(
        `
        CREATE OR REPLACE FUNCTION milestone__insert ()
          RETURNS TRIGGER
          LANGUAGE plpgsql
          AS $$
        BEGIN
          UPDATE
            milestone_album
          SET
            total_milestone = total_milestone + 1
          WHERE
            milestone_album.id = NEW.album_id;
          RETURN NULL;
        END;
        $$;
        
        DROP TRIGGER IF EXISTS trg_milestone__insert ON "milestone";
        
        CREATE TRIGGER trg_milestone__insert
          AFTER INSERT ON "milestone"
          FOR EACH ROW
          EXECUTE PROCEDURE milestone__insert ();
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
        DROP TRIGGER IF EXISTS trg_milestone__insert ON "milestone";
        DROP FUNCTION IF EXISTS milestone__insert();
        `,
        { transaction }
      );
      await queryInterface.dropTable('milestone', { transaction });
      await transaction.commit();
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }
    }
  },
};
