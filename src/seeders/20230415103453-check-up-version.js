import { v4 as uuidv4 } from 'uuid';

const samples = [
  {
    name: 'Australia',
    main_color: '#5393D0',
    sub_color: '#D9EBFA',
  },
  {
    name: 'Vietnam',
    main_color: '#7D67DF',
    sub_color: '#E4E0F8',
  },
  {
    name: 'Philippines',
    main_color: '#FC7C7C',
    sub_color: '#FEE9EC',
  },
  {
    name: 'Singapore',
    main_color: '#53C2D0',
    sub_color: '#CBECF1',
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
      const existedVersions = await queryInterface.sequelize.query(
        `
        SELECT * FROM check_up_version WHERE is_suggested = TRUE
        `
      );

      if (!existedVersions[0].length) {
        const statesAdded = [];
        for (const sample of samples) {
          const record = await queryInterface.rawSelect(
            'check_up_version',
            {
              where: {
                name: sample.name,
              },
            },
            ['id']
          );

          if (!record) {
            statesAdded.push({ ...sample, id: uuidv4(), is_suggested: true, is_released: true });
          }
        }
        if (statesAdded.length) return queryInterface.bulkInsert('check_up_version', statesAdded);
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
    await queryInterface.bulkDelete('check_up_version', []);
  },
};
