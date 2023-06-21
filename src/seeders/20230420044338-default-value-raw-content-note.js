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
      const notes = await queryInterface.sequelize.query(
        `
        SELECT * FROM note
        `
      );

      await Promise.all(
        notes[0].map(async (note) => {
          const rawContent = JSON.parse(note.content).reduce((str, value) => `${str} ${value.text.trim()}`, '');
          return queryInterface.sequelize.query(`UPDATE note SET raw_content='${rawContent}' WHERE id='${note.id}';`);
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
    await queryInterface.sequelize.query(`UPDATE note SET raw_content=null;`);
  },
};
