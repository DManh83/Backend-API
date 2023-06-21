import { v4 as uuidv4 } from 'uuid';

const tags = [
  { name: 'Groceries', type: 1 },
  { name: 'Medication', type: 2 },
  { name: 'Journal', type: 3 },
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
      const existedTags = await queryInterface.sequelize.query(
        `
        SELECT * FROM tag WHERE user_id IS NULL
        `
      );

      if (!existedTags[0].length) {
        const statesAdded = [];
        for (const tag of tags) {
          const record = await queryInterface.rawSelect(
            'tag',
            {
              where: {
                name: tag.name,
              },
            },
            ['id']
          );
          if (!record) {
            statesAdded.push({ ...tag, id: uuidv4() });
          }
        }
        if (statesAdded.length) return queryInterface.bulkInsert('tag', statesAdded);
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
    await queryInterface.bulkDelete('tag', [], {});
  },
};
