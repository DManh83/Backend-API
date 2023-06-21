import cors from 'cors';
import App from './app';
import { API_PREFIX } from './common/constants';
import routes from './routes';

const middleWares = [cors()];

const app = new App({
  port: parseInt(process.env.APP_PORT) || 4044,
  apiPrefix: API_PREFIX,
  middleWares,
  routes,
});

app.listen();
