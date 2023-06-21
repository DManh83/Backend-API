# Baby Book API

## Overview

Backend for Baby Book

## Install dependencies

- Run command `npm install` to install all package

## Migration

- To create new migration file

```bash
   npm run db:migration:generate {file-name}
```

- New migration file will be created with format name `{timestamp}-{file-name}.js` in src/migrations folder
- To run migration run command:

```bash
   npm run db:migrate
```

## Seeder

- To create new seed file

```bash
   npm run db:seed:generate {file-name}
```

- New seed file will be created with format name `{timestamp}-{file-name}.js` in src/seeders folder

- To seed data run command:

```bash
   npm run db:seed
```

## Non-Docker start locally

Create .env file and prepare all env variables

```
   cp .env.example .env
```

Start Service

```
   npm run dev
```

## Start with docker (Recommended use for Production)

```
   docker-compose up --build -d

```

## Test

- Run test with jest

```bash
   npm run test
```

## Project structure

````
.
├── src
|    ├── assets
|    ├── common
|    |     ├── email-template
|    |     ├── errors
|    |     ├── helpers
|    |     ├── lib
|    |     ├── repositories
|    |     ├── models
|    |     └── ```
|    ├── middlewares
|    |     ├── authentication.ts
|    |     └── ```
|    ├── migrations
|    |     ├── ${timestamp}-${file-name}.js
|    |     └── ```
|    ├── repositories
|    ├── routes
|    ├── services
|    ├── models
|    ├── controllers
|    ├── validators
|    └── ```
|    ├── seeders
|    |     ├── ${timestamp}-${file-name}.js
|    |     └── ```
|    ├── typings
|    |     └── ```
|    ├── app.ts
|    ├── routes.ts
|    └── index.ts
├── package.json
├── README.md
├── tsconfig.migrations.json
└── tsconfig.json
````

## Stay in touch

- Author - Baby Book

## License

UNLICENSED.
