var fs = require('fs');
var sqlite = require('spatialite');

class NewSqlite {
    static getConnect(sqlPath) {
        var exists = fs.existsSync(sqlPath);
        if (!exists) {
            throw new Error('路径 ' + sqlPath + ' 下数据库文件不存在');
        }

        // 数据源不能重复创建，否则会出现同一接口和参数返回数据不一致的问题
        if (!this.connections || !this.connections[sqlPath]) {
            if (!this.connections) {
                this.connections = {};
            }
            if (!this.connections[sqlPath]) {
                this.connections[sqlPath] = new sqlite.Database(sqlPath);
            }
        }
        return this.connections[sqlPath];
    }
}
module.exports = NewSqlite;