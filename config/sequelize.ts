import config, { Environment } from './env';

const createSequelizeConfigForEnv = (environment) => {
  switch (environment) {
    case Environment.Production: {
      return {
        production: config.database,
      };
    }
    default: {
      return {
        development: config.database,
      };
    }
  }
};

// Needs to be `module.exports` as required by Sequelize CLI
// http://docs.sequelizejs.com/manual/migrations.html#configuration
module.exports = createSequelizeConfigForEnv(process.env.NODE_ENV);
