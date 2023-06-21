module.exports = {
  apps: [
    {
      name: 'baby-book-production',
      script: 'dist/src/index.js',
      instances: 'max',
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      output: '/dev/null',
      error: '/dev/null',
    },
    {
      name: 'baby-book-cronjob',
      script: 'dist/src/crons/launcher.js',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      output: '/dev/null',
      error: '/dev/null',
    },
  ],
};
