import { v4 as uuidv4 } from 'uuid';

const samples = [
  {
    name: 'Australia',
    age: [
      {
        month: 0,
        antigen: ['Hepatitis B (HepB)', 'Rotavirus'],
      },
      {
        month: 2,
        antigen: ['Rotavirus', 'Pneumococcal polysaccharide'],
      },
      {
        month: 4,
        antigen: ['Diphtheria, tetanus, & acellular pertussis', 'Rotavirus'],
      },
      {
        month: 6,
        antigen: ['Diphtheria, tetanus, & acellular pertussis'],
      },
    ],
  },
  {
    name: 'Vietnam',
    age: [
      {
        month: 0,
        antigen: ['Hepatitis B (HepB)', 'Rotavirus'],
      },
      {
        month: 2,
        antigen: ['Rotavirus', 'Tetanus, diphtheria, & acellular pertussis', 'Diphtheria, tetanus, & acellular pertussis'],
      },
      {
        month: 4,
        antigen: ['Diphtheria, tetanus, & acellular pertussis', 'Rotavirus'],
      },
      {
        month: 6,
        antigen: ['Hepatitis B (HepB)', 'Diphtheria, tetanus, & acellular pertussis'],
      },
    ],
  },
  {
    name: 'Philippines',
    age: [
      {
        month: 0,
        antigen: ['Hepatitis B (HepB)'],
      },
    ],
  },
  {
    name: 'Singapore',
    age: [
      {
        month: 0,
        antigen: ['Hepatitis B (HepB)', 'Bacillus Calmette-Guérin (BCG)'],
      },
      {
        month: 2,
        antigen: [
          'Hepatitis B (HepB)',
          'Diphtheria, tetanus, & acellular pertussis',
          'Inactivated poliovirus',
          'Haemophilus influenzae type b',
        ],
      },
      {
        month: 4,
        antigen: [
          'Diphtheria, tetanus, & acellular pertussis',
          'Inactivated poliovirus',
          'Haemophilus influenzae type b',
          'Pneumococcal conjugate',
        ],
      },
      {
        month: 6,
        antigen: [
          'Hepatitis B (HepB)',
          'Diphtheria, tetanus, & acellular pertussis',
          'Inactivated poliovirus',
          'Haemophilus influenzae type b',
          'Pneumococcal conjugate',
        ],
      },
      {
        month: 12,
        antigen: ['Pneumococcal conjugate', 'Measles, mumps, rubella', 'Varicella'],
      },
      {
        month: 15,
        antigen: ['Measles, mumps, rubella', 'Varicella'],
      },
      {
        month: 18,
        antigen: ['Diphtheria, tetanus, & acellular pertussis', 'Inactivated poliovirus', 'Haemophilus influenzae type b'],
      },
    ],
  },
];

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */

    try {
      const existedRecords = await queryInterface.sequelize.query(
        `
        SELECT * FROM immunization WHERE is_suggested = TRUE
        `
      );

      if (!existedRecords[0].length) {
        const [vaccinations, antigens] = await Promise.all([
          queryInterface.sequelize.query(`SELECT * FROM vaccination WHERE is_suggested = TRUE`),
          queryInterface.sequelize.query(`SELECT * FROM antigen WHERE user_id IS NULL`),
        ]);

        const immunizations = [];

        samples.forEach((sample) => {
          const existedVaccination = vaccinations[0].find((vaccination) => vaccination.name === sample.name);
          if (existedVaccination) {
            sample.age.forEach((age) => {
              age.antigen.forEach((ageAntigen) => {
                const existedAntigen = antigens[0].find((antigen) => antigen.name === ageAntigen);
                if (existedAntigen) {
                  immunizations.push({
                    vaccination_id: existedVaccination.id,
                    antigen_id: existedAntigen.id,
                    is_suggested: existedVaccination.is_suggested,
                    month_old: age.month,
                    id: uuidv4(),
                  });
                }
              });
            });
          }
        });

        const statesAdded = [];
        const immunizationAntigens = [];

        for (const immunization of immunizations) {
          immunizationAntigens.push({
            id: uuidv4(),
            immunization_id: immunization.id,
            antigen_id: immunization.antigen_id,
          });
          statesAdded.push({ ...immunization, is_suggested: true });
        }

        if (statesAdded.length) await queryInterface.bulkInsert('immunization', statesAdded);
        if (immunizationAntigens.length) await queryInterface.bulkInsert('immunization_antigen', immunizationAntigens);
        return;
      }
    } catch (error) {
      return Promise.resolve();
    }
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('immunization', []);
    await queryInterface.bulkDelete('immunization_antigen', []);
  },
};
