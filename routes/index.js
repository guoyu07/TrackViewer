import search from './search';
import business from './business';
const routerDispatcher = function (app) {
  app.use('/trackView/search', search);
  app.use('/trackView/business', business);
};

export default routerDispatcher;
