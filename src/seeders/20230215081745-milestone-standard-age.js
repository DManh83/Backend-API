import { v4 as uuidv4 } from 'uuid';

const ages = [
  { id: uuidv4(), subject: 'What your baby can do at', day: 0, month: 2, year: 0 },
  { id: uuidv4(), subject: 'What your baby can do at', day: 0, month: 4, year: 0 },
  { id: uuidv4(), subject: 'What your baby can do at', day: 0, month: 6, year: 0 },
  { id: uuidv4(), subject: 'What your baby can do at', day: 0, month: 9, year: 0 },
  { id: uuidv4(), subject: 'What your baby can do at', day: 0, month: 12, year: 0 },
  { id: uuidv4(), subject: 'What your baby can do at', day: 0, month: 15, year: 0 },
  { id: uuidv4(), subject: 'What your baby can do at', day: 0, month: 18, year: 0 },
  { id: uuidv4(), subject: 'What your baby can do at', day: 0, month: 0, year: 2 },
  { id: uuidv4(), subject: 'What your baby can do at', day: 0, month: 30, year: 0 },
  { id: uuidv4(), subject: 'What your baby can do at', day: 0, month: 0, year: 3 },
  { id: uuidv4(), subject: 'What your baby can do at', day: 0, month: 0, year: 4 },
  { id: uuidv4(), subject: 'What your baby can do at', day: 0, month: 0, year: 5 },
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
      const existedAges = await queryInterface.sequelize.query(
        `
        SELECT * FROM milestone_standard_age
        `
      );

      if (!existedAges[0].length) {
        const statesAdded = [];
        for (const age of ages) {
          const record = await queryInterface.rawSelect(
            'milestone_standard_age',
            {
              where: {
                subject: age.subject,
                day: age.day,
                month: age.month,
                year: age.year,
              },
            },
            ['id']
          );
          if (!record) {
            statesAdded.push({ ...age, id: uuidv4() });
          }
        }
        if (statesAdded.length) return queryInterface.bulkInsert('milestone_standard_age', statesAdded);
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
    await queryInterface.bulkDelete('milestone_standard_age', []);
  },
};
