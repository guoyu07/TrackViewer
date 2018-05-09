var search = require('./search.js');
var business = require('./business.js');

// import search from './search';
// import business from './business';

/**
 * 顶层路由控制器
 * @param app
 */
const routerDispatcher = function (app) {

    /**
     * 用于判断nodejs服务是否启动
     */
    app.use('/trackView/testStart', function (req, res) {
        res.end('');
    });

    /**
     * 瓦片查询路由
     */
    app.use('/trackView/search', search);

    /**
     * 业务处理路由
     */
    app.use('/trackView/business', business);
};

// export default routerDispatcher;
module.exports = routerDispatcher;
