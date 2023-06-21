import { v4 as uuidv4 } from 'uuid';

const samples = [
  'Hepatitis B (HepB)',
  'Rotavirus',
  'Pneumococcal polysaccharide',
  'Diphtheria, tetanus, & acellular pertussis',
  'Tetanus, diphtheria, & acellular pertussis',
  'Bacillus Calmette-Guérin (BCG)',
  'Inactivated poliovirus',
  'Haemophilus influenzae type b',
  'Pneumococcal conjugate',
  'Measles, mumps, rubella',
  'Varicella',
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
        SELECT * FROM antigen WHERE user_id IS NULL
        `
      );

      if (!existedRecords[0].length) {
        const statesAdded = [];
        for (const name of samples) {
          const record = await queryInterface.rawSelect(
            'antigen',
            {
              where: {
                name,
              },
            },
            ['id']
          );
          if (!record) {
            statesAdded.push({ name, id: uuidv4() });
          }
        }
        if (statesAdded.length) return queryInterface.bulkInsert('antigen', statesAdded);
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
    await queryInterface.bulkDelete('antigen', [], {});
  },
};
