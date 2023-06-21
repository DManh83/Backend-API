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
      await queryInterface.sequelize.query(
        `
        UPDATE growth_point SET is_released = TRUE, version_year = 2022 WHERE baby_book_id IS NULL AND user_id IS NULL AND is_released IS NULL AND version_year IS NULL
        `
      );
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
    await queryInterface.sequelize.query(
      `UPDATE growth_point SET is_released = NULL, version_year = NULL WHERE baby_book_id IS NULL AND user_id IS NULL AND is_released = TRUE AND version_year = 2022`
    );
  },
};
