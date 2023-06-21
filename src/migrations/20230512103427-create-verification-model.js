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
        'verification',
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
          type: {
            type: Sequelize.ENUM('email', 'sms'),
            allowNull: false,
          },
          isVerified: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false,
            field: 'is_verified',
          },
          isDefault: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false,
            field: 'is_default',
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
        CREATE OR REPLACE FUNCTION user__insert()
          RETURNS TRIGGER
          LANGUAGE plpgsql
          AS $$
        BEGIN
          INSERT INTO
            "verification" (id, user_id, type, is_default)
          VALUES (gen_random_uuid(), NEW.id, 'email', true), (gen_random_uuid(), NEW.id, 'sms', false);
          RETURN NEW;
        END;
        $$;
        
        DROP TRIGGER IF EXISTS trg_user__insert ON "user";
        
        CREATE TRIGGER trg_user__insert
          AFTER INSERT ON "user"
          FOR EACH ROW
          EXECUTE PROCEDURE user__insert();
  
        ----- Update verification type default -----
        CREATE OR REPLACE FUNCTION verification__update()
          RETURNS TRIGGER
          LANGUAGE plpgsql
          AS $$
        BEGIN
          IF NEW.is_default = TRUE THEN
          UPDATE
            verification
          SET
            is_default = FALSE
          WHERE
            verification.user_id = NEW.user_id AND verification.id <> NEW.id;
          END IF;
          RETURN NEW;
        END;
        $$;
        
        DROP TRIGGER IF EXISTS trg_verification__update ON "verification";
        
        CREATE TRIGGER trg_verification__update
          BEFORE UPDATE ON "verification"
          FOR EACH ROW
          EXECUTE PROCEDURE verification__update();
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
        DROP TRIGGER IF EXISTS trg_user__insert ON "user";
        DROP FUNCTION IF EXISTS user__insert();
 
        DROP TRIGGER IF EXISTS trg_verification__update ON "verification";
        DROP FUNCTION IF EXISTS verification__update();
        `,
        { transaction }
      );
      await queryInterface.dropTable('verification', { transaction });
      await transaction.commit();
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }
    }
  },
};
