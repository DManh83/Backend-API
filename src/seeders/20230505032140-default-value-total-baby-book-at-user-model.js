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
      const users = await queryInterface.sequelize.query(
        `
        SELECT * FROM "user"
        `
      );

      await Promise.all(
        users[0].map(async (user) => {
          const totalBabyBook = await queryInterface.sequelize.query(`SELECT count(user_id) FROM baby_book WHERE user_id = '${user.id}';`);

          return queryInterface.sequelize.query(`UPDATE "user" SET total_baby_book=${totalBabyBook[0][0].count} WHERE id='${user.id}';`);
        })
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
    await queryInterface.sequelize.query(`UPDATE "user" SET total_baby_book=0;`);
  },
};
