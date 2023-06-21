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
      return Promise.all([
        queryInterface.sequelize.query(
          `
        UPDATE vaccination SET country = vaccination.name  WHERE country IS NULL
        `
        ),
        queryInterface.sequelize.query(
          `
        UPDATE check_up_version SET source = check_up_version.name  WHERE source IS NULL
        `
        ),
      ]);
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
    await queryInterface.bulkDelete('vaccination', []);
  },
};
