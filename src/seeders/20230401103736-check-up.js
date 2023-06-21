import { v4 as uuidv4 } from 'uuid';

const samples = [
  {
    title: 'Health Checks',
    ageDue: 'Approximately 0-4 weeks',
    monthDue: 1,
  },
  {
    title: 'Health Checks',
    ageDue: 'Approximately 2 month (6-8 weeks)',
    monthDue: 2,
  },
  {
    title: 'Health Checks',
    ageDue: 'Approximately 4 months',
    monthDue: 4,
  },
  {
    title: "Health Checks (Parent's evaluation of development status)",
    ageDue: 'Approximately 6 months',
    monthDue: 6,
  },
  {
    title: 'Health Checks',
    ageDue: 'Approximately 6 months',
    monthDue: 6,
  },
  {
    title: "Health Checks (Parent's evaluation of development status)",
    ageDue: 'Approximately 12 months',
    monthDue: 12,
  },
  {
    title: 'Health Checks',
    ageDue: 'Approximately 12 months',
    monthDue: 12,
  },
  {
    title: "Health Checks (Parent's evaluation of development status)",
    ageDue: 'Approximately 18 months',
    monthDue: 18,
  },
  {
    title: 'Health Checks',
    ageDue: 'Approximately 18 months',
    monthDue: 18,
  },
  {
    title: "Health Checks (Parent's evaluation of development status)",
    ageDue: 'Approximately 2 years',
    monthDue: 24,
  },
  {
    title: 'Health Checks',
    ageDue: 'Approximately 2 years',
    monthDue: 24,
  },
  {
    title: "Health Checks (Parent's evaluation of development status)",
    ageDue: 'Approximately 3 years',
    monthDue: 36,
  },
  {
    title: 'Health Checks',
    ageDue: 'Approximately 3 years',
    monthDue: 36,
  },
  {
    title: "Health Checks (Parent's evaluation of development status)",
    ageDue: 'Approximately 4 years',
    monthDue: 48,
  },
  {
    title: 'Health Checks',
    ageDue: 'Approximately 4 years',
    monthDue: 48,
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
        SELECT * FROM check_up WHERE is_suggested = TRUE
        `
      );

      if (!existedRecords[0].length) {
        const checkUpVersions = await queryInterface.sequelize.query(
          `
          SELECT * FROM check_up_version WHERE is_suggested = TRUE
          `
        );

        const checkUps = [];

        checkUpVersions[0].forEach((version) => {
          samples.forEach((sample) => {
            checkUps.push({
              check_up_version_id: version.id,
              is_suggested: version.is_suggested,
              title: sample.title,
              age_due: sample.ageDue,
              month_due: sample.monthDue,
            });
          });
        });

        const statesAdded = [];
        for (const checkUp of checkUps) {
          const record = await queryInterface.rawSelect(
            'check_up',
            {
              where: {
                check_up_version_id: checkUp.check_up_version_id,
                month_due: checkUp.month_due,
              },
            },
            ['id']
          );

          if (!record) {
            statesAdded.push({ ...checkUp, id: uuidv4() });
          }
        }
        if (statesAdded.length) return queryInterface.bulkInsert('check_up', statesAdded);
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
    await queryInterface.bulkDelete('check_up', []);
  },
};
