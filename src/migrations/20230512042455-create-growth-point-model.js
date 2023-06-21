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
        'growth_point',
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
          date: {
            type: Sequelize.DATE,
          },
          color: {
            type: Sequelize.STRING(),
          },
          headCircumference: {
            type: Sequelize.FLOAT,
            defaultValue: 0,
            allowNull: false,
            field: 'head_circumference',
          },
          weight: {
            type: Sequelize.FLOAT,
            defaultValue: 0,
            allowNull: false,
          },
          height: {
            type: Sequelize.FLOAT,
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
          isPercentile: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false,
            field: 'is_percentile',
          },
          level: {
            type: Sequelize.STRING(),
          },
          sex: {
            type: Sequelize.ENUM('male', 'female'),
          },
          ageMonth: {
            type: Sequelize.FLOAT,
            defaultValue: 0,
            allowNull: false,
            field: 'age_month',
          },
        },
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

      await queryInterface.dropTable('growth_point');

      await transaction.commit();
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
      }
    }
  },
};
