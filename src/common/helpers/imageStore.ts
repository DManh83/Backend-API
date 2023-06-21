import fs from 'fs-extra';
import env from '../../../config/env';
import { API_PREFIX, FILE_PREFIX } from '../constants';

const imageStore = {
  getUrl: (userId, filename) => (filename ? `${env.apiUrl}${API_PREFIX}${FILE_PREFIX}/${userId}/${filename}` : null),
  deleteFile: async (userId, filename) => {
    const filePath = `${env.assetsPath}/${userId}/${filename}`;
    return fs.remove(filePath);
  },
  getPath: (path) => (path ? `${env.apiUrl}${API_PREFIX}${FILE_PREFIX}/${path}` : null),
  deletePath: async (path) => {
    const filePath = `${env.assetsPath}/${path}`;
    return fs.remove(filePath);
  },
};

export default imageStore;
