import { v4 as uuidv4 } from 'uuid';

const groups = [
  { id: uuidv4(), name: 'Social/Emotional' },
  { id: uuidv4(), name: 'Language/Communication' },
  { id: uuidv4(), name: 'Cognitive (learning, thinking, problem-solving)' },
  { id: uuidv4(), name: 'Movement/Physical Development' },
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
      const existedGroups = await queryInterface.sequelize.query(
        `
        SELECT * FROM milestone_standard_group
        `
      );

      if (!existedGroups[0].length) {
        const statesAdded = [];
        for (const group of groups) {
          const record = await queryInterface.rawSelect(
            'milestone_standard_group',
            {
              where: {
                name: group.name,
              },
            },
            ['id']
          );
          if (!record) {
            statesAdded.push({ ...group, id: uuidv4() });
          }
        }
        if (statesAdded.length) return queryInterface.bulkInsert('milestone_standard_group', statesAdded);
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
    await queryInterface.bulkDelete('milestone_standard_group', [], {});
  },
};
