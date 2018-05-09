var NewSqlite = require('../../../sqliteConnect.js');
var FilePathResolve = require('../../../utils/FilePathResolve.js');
// import NewSqlite from '../../../sqliteConnect.js';

var logger = require('../../../../log4js').logger;

class Search {
    constructor (dirIndex, type) {
        this.type = type;
        let sqlPath = FilePathResolve.getInstance().getSourceArr()[dirIndex].sqlPath;
        this.connection = NewSqlite.getConnect(sqlPath);
    }

    /**
     * 根据参数查询瓦片数据,子类需要重写
     * @param x
     * @param y
     * @param z
     * @param {String} mode 照片模式或者视频模式
     */
    getByTileByMode(x, y, z, mode) {
        throw new Error('子类必须重写getByTileByMode此方法!');
    }

    executeSql(sql) {
        const self = this;
        return new Promise((resolve, reject) => {
            self.connection.spatialite(function(er) {
                if (er) {
                    logger.error(er);
                    reject(er);
                } else {
                    self.connection.all(sql, function(err, rows) {
                        if (err) {
                            logger.error(err);
                            reject(err);
                        } else {
                            resolve(rows);
                        }
                    });
                }
            });
        }).catch(err => {
            logger.error(err);
        });
    }
}
// export default Search;
module.exports = Search;