import { v4 as uuidv4 } from 'uuid';

const samples = [
  {
    min_age_month: 0,
    max_age_month: 2,
    text: 'Age 0-2 years old',
  },
  {
    min_age_month: 2,
    max_age_month: 5,
    text: 'Age 2-5 years old',
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
        SELECT * FROM age_period
        `
      );

      if (!existedRecords[0].length) {
        const statesAdded = [];
        for (const period of samples) {
          const record = await queryInterface.rawSelect(
            'age_period',
            {
              where: {
                min_age_month: period.min_age_month,
                max_age_month: period.max_age_month,
                text: period.text,
              },
            },
            ['id']
          );

          if (!record) {
            statesAdded.push({ ...period, id: uuidv4() });
          }
        }
        if (statesAdded.length) return queryInterface.bulkInsert('age_period', statesAdded);
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
    await queryInterface.bulkDelete('age_period', []);
  },
};
