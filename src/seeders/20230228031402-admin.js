import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from '../common/lib/Bcrypt';

const admins = [
  {
    id: uuidv4(),
    first_name: 'Linda',
    last_name: 'Tran',
    email: 'hang40338@gmail.com',
    password: bcrypt.generateHashPassword('Hang123@'),
    phone: '+84396652104',
    country_code: 'VN',
    role: 'admin',
  },
];

module.exports = {
  up: async (queryInterface, Sequelize) => {
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
      const statesAdded = [];
      for (const admin of admins) {
        const record = await queryInterface.rawSelect(
          'user',
          {
            where: {
              [Op.or]: [
                {
                  email: admin.email,
                },
                {
                  phone: admin.phone,
                },
              ],
            },
          },
          ['id']
        );
        if (!record) {
          statesAdded.push({ ...admin, id: uuidv4() });
        }
      }
      if (statesAdded.length) return queryInterface.bulkInsert('user', statesAdded);
    } catch (error) {
      return Promise.resolve();
    }
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
