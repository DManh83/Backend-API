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
        'general_information',
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
            unique: true,
            allowNull: false,
            field: 'baby_book_id',
            onDelete: 'CASCADE',
          },
          lastName: {
            type: Sequelize.STRING(50),
            field: 'last_name',
          },
          givenName: {
            type: Sequelize.STRING(50),
            field: 'given_name',
          },
          address: {
            type: Sequelize.STRING(200),
          },
          birthday: {
            type: Sequelize.DATE,
          },
          sex: {
            type: Sequelize.ENUM('male', 'female'),
          },
          birthWeight: {
            type: Sequelize.FLOAT(6),
            field: 'birth_weight',
          },
          birthtime: {
            type: Sequelize.STRING(10),
          },
          language: {
            type: Sequelize.STRING(20),
          },
          totalSibling: {
            type: Sequelize.INTEGER(),
            field: 'total_sibling',
          },
          mother: {
            type: Sequelize.STRING(50),
            field: 'mother',
          },
          motherPhone: {
            type: Sequelize.STRING(20),
            field: 'mother_phone',
          },
          motherWorkPhone: {
            type: Sequelize.STRING(20),
            field: 'mother_work_phone',
          },
          motherEmail: {
            type: Sequelize.STRING(50),
            field: 'mother_email',
          },
          father: {
            type: Sequelize.STRING(50),
            field: 'father',
          },
          fatherPhone: {
            type: Sequelize.STRING(20),
            field: 'father_phone',
          },
          fatherWorkPhone: {
            type: Sequelize.STRING(20),
            field: 'father_work_phone',
          },
          fatherEmail: {
            type: Sequelize.STRING(50),
            field: 'father_email',
          },
          insuranceNumber: {
            type: Sequelize.STRING(200),
            field: 'insurance_number',
          },
          insuranceFirstName: {
            type: Sequelize.STRING(50),
            field: 'insurance_first_name',
          },
          insuranceSurname: {
            type: Sequelize.STRING(50),
            field: 'insurance_surname',
          },
          insuranceBirthday: {
            type: Sequelize.DATE,
            field: 'insurance_birthday',
          },
          insuranceAddress: {
            type: Sequelize.STRING(200),
            field: 'insurance_address',
          },
          idSticker: {
            type: Sequelize.STRING(200),
            field: 'id_sticker',
          },
          practitioner: {
            type: Sequelize.STRING(50),
          },
          practitionerPhone: {
            type: Sequelize.STRING(20),
            field: 'practitioner_phone',
          },
          hospital: {
            type: Sequelize.STRING(200),
          },
          hospitalPhone: {
            type: Sequelize.STRING(20),
            field: 'hospital_phone',
          },
          nurse: {
            type: Sequelize.STRING(50),
          },
          nursePhone: {
            type: Sequelize.STRING(20),
            field: 'nurse_phone',
          },
          dentist: {
            type: Sequelize.STRING(50),
          },
          dentistPhone: {
            type: Sequelize.STRING(20),
            field: 'dentist_phone',
          },
          pediatrician: {
            type: Sequelize.STRING(50),
          },
          pediatricianPhone: {
            type: Sequelize.STRING(20),
            field: 'pediatrician_phone',
          },
          other: {
            type: Sequelize.STRING(200),
          },
          otherPhone: {
            type: Sequelize.STRING(20),
            field: 'other_phone',
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
        CREATE OR REPLACE FUNCTION baby_book__create ()
          RETURNS TRIGGER
          LANGUAGE plpgsql
          AS $$
        BEGIN
          INSERT INTO "general_information" (id, user_id, baby_book_id, birthday)
            VALUES(gen_random_uuid (), NEW.user_id, NEW.id, NEW.birthday);
          RETURN NEW;
        END;
        $$;

        DROP TRIGGER IF EXISTS trg_baby_book__create ON "baby_book";

        CREATE TRIGGER trg_baby_book__create
          AFTER INSERT ON "baby_book"
          FOR EACH ROW
          EXECUTE PROCEDURE baby_book__create ();
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
    await queryInterface.dropTable('general_information');
  },
};
