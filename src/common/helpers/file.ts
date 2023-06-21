import fs from 'fs';

const createFolderIfNotExists = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
};

export default {
  createFolderIfNotExists,
};
