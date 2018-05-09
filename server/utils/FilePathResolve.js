let conf = require('../../config/config.js');
let NewSqlite = require('../sqliteConnect');

// import conf from '../../config/config'
// import NewSqlite from '../sqliteConnect';

let lodash = require('lodash');
let logger = require('../../log4js').logger;
let dateFormat = require('dateformat');
let fs = require('fs');
let path = require('path');


/**
 * 文件夹路径解析类 (单例类)
 * @author    wuzhen
 * @date      2018/03/08
 * @copyright @Navinfo, all rights reserved.
 */
class FilePathResolve {
    /**
     * 构造方法.
     *
     * @returns {undefined}
     */
    constructor () {

    }

    /**
     * 查询filePath下的目录结构
     * @param {String} string 路径
     * @returns {Array} 返回数组对象，目录搜索到sqlite文件这一级，如果存在photomode目录则添加到返回值中，如果存在videomode目录则添加到返回值中.
     */
    fileDisplay (filePath) {
        var self = this;
        var folders = ['center', 'left', 'right'];
        var dirIndex = 0;
        folders.forEach(function (folder, index) {
            let baseDir = path.join(filePath, folder); // data/center
            if (fs.existsSync(baseDir)) {
                let videoMode = path.join(baseDir, 'videomode');
                let photoMode = path.join(baseDir, 'photomode');
                dirIndex = self.generFileObj(videoMode, dirIndex, folder, baseDir);
                dirIndex = self.generFileObj(photoMode, dirIndex, folder, baseDir);
            }
        });
        this.createTempTables();
        // this.queryLink();
        // this.task();
    }

    generFileObj (modeDir, ind, flag, baseDir) {
        let self = this;
        let index = ind;
        if (fs.existsSync(modeDir)) {
            let fileList = fs.readdirSync(modeDir);
            fileList.forEach(function (item) {
                var dateDir = path.join(modeDir, item);
                var sqlPath = path.join(dateDir, 'playback.sqlite');
                if (!fs.existsSync(sqlPath)) {
                    return;
                }
                var temp = {
                    baseDir: baseDir,
                    filePath: dateDir,
                    sqlPath: sqlPath,
                    createTime: item,
                    flag: flag,
                    dirIndex: index++,
                    mode: 'videomode'
                };
                self._sourceArr.push(temp);
            });
        }
        return index;
    }

    /**
     * 查询filePath下的目录结构
     * @param {String} string 路径
     * @returns {Array} 返回数组对象，目录搜索到sqlite文件这一级，如果存在photomode目录则添加到返回值中，如果存在videomode目录则添加到返回值中.
     */
    fileDisplayBack (filePath) {
        var self = this;
        var folder = ['center', 'left', 'right'];
        var dirIndex = 0;
        folder.forEach(function (item, index) {
            let baseDir = path.join(filePath, item); // data/center
            if (fs.existsSync(baseDir)) {
                let sqlPath = path.join(baseDir, 'playback.sqlite');
                if (fs.existsSync(sqlPath)) {
                    let fileStat = fs.statSync(baseDir);
                    var temp = {
                        baseDir: baseDir,
                        sqlPath: sqlPath,
                        createTime: dateFormat(fileStat.ctime, 'yyyy-mm-dd'),
                        flag: item
                    };
                    let photomodePath = path.join(baseDir, 'photomode');
                    if (fs.existsSync(photomodePath)) {
                        temp.mode = 'photomode';
                        temp.dirIndex = dirIndex++;
                        temp.filePath = photomodePath;
                        self._sourceArr.push(temp);
                    }
                    let videomodePath = path.join(baseDir, 'videomode');
                    if (fs.existsSync(videomodePath)) {
                        temp = lodash.clone(temp);
                        temp.mode = 'videomode';
                        temp.dirIndex = dirIndex++;
                        temp.filePath = videomodePath;
                        self._sourceArr.push(temp);
                    }
                }
            }
        });
        this.createTempTables();
        // this.queryLink();
        // this.task();
    }

    queryLink() {
        let sqlPath = this._sourceArr[1].sqlPath;
        sqlPath = path.join('./', sqlPath);
        let db = NewSqlite.getConnect(sqlPath);
        let sql = 'select a.sNodePid, AsGeoJSON(a.geometry) AS geometry from link_temp a';
        db.spatialite(function(err) {
            if (err) {
                return;
            }
            db.all(sql, function(er, rows) {
                logger.info(er, rows);
            });
        });
    }

    createTempTables() {
        for (let i = 0; i < this._sourceArr.length; i++) {
            let source = this._sourceArr[i];
            // let sqlPath = source.sqlPath;
            let dirIndex = source.dirIndex;
            let mode = source.mode;
            let tableName = 'track_collection_link_temp';
            let tablePoint = 'track_collection';
            let tablePhoto = 'track_collection_photo';
            if (mode === 'photomode') {
                tableName = 'track_contshoot_link_temp';
                tablePoint = 'track_contshoot';
                tablePhoto = 'track_contshoot_photo';
            }

            this.createTable(dirIndex, tableName, tablePoint, tablePhoto);
        }
    }

    createTable(dirIndex, tableName, tablePoint, tablePhoto) {
        let sqlPath = this._sourceArr[dirIndex].sqlPath;
        let db = NewSqlite.getConnect(sqlPath);
        db.spatialite(function(e1) {
            if (e1) {
                logger.error(e1);
                return;
            }
            let sql = `SELECT COUNT(*) flag  FROM sqlite_master where type='table' and name='${tableName}'`;
            db.all(sql, function (e2, r1) {
                if (e2) {
                    logger.error(e2);
                    return;
                }
                if (r1[0].flag > 0) {
                    logger.info(`表${tableName}已经存在，不需要重复创建`);
                    return;
                }
                sql = `drop table if exists '${tableName}'`;
                db.all(sql, function (e3, r3) {
                    if (e3) {
                        logger.error(e3);
                        return;
                    }
                    sql = `create table '${tableName}' (
                    'id' integer  PRIMARY key autoincrement,
                    'sNodePid' text not null,
                    'eNodePid' text not null,
                    'geometry' GEOMETRY )`;
                    db.all(sql, function (e4, r4) {
                        if (e4) {
                            logger.error(e4);
                            return;
                        }
                        sql = `select a.id, AsGeoJSON(a.geometry) AS geometry, a.recordTime 
                            from '${tablePoint}' a , '${tablePhoto}' b where a.id = b.id order by a.recordTime `;
                        db.all(sql, function(err, rows) {
                            if (err) {
                                logger.error(err);
                                return;
                            }
                            if (rows.length < 1) {
                                return;
                            }
                            let sqlStr = `insert into '${tableName}' ('sNodePid', 'eNodePid', 'geometry') values `;
                            for (let i = 0; i < rows.length - 1; i++) {
                                let sId = rows[i].id;
                                let eId = rows[i + 1].id;
                                let sDate = rows[i].recordTime.substr(0, 8);
                                let eDate = rows[i + 1].recordTime.substr(0, 8);
                                let sCoordinates = JSON.parse(rows[i].geometry).coordinates;
                                let eCoordinates = JSON.parse(rows[i + 1].geometry).coordinates;
                                let geo = {
                                    type: 'LineString',
                                    coordinates: [sCoordinates, eCoordinates]
                                };
                                if (sDate === eDate) {
                                    geo = JSON.stringify(geo);
                                    sqlStr += ` ('${sId}', '${eId}', GeomFromGeoJSON('${geo}') ), `;
                                }
                            }
                            sqlStr = sqlStr.substring(0, sqlStr.lastIndexOf(','));
                            db.all(sqlStr, function(er, r) {
                                if (er) {
                                    logger.error(er);
                                } else {
                                    logger.info('临时道路线表' + tableName + ' 生成成功!');
                                }
                            });
                        });
                    });
                });
            });
        });
    }

    /**
     * 获取默认配置路径下的文件夹路径
     * @returns {Array}
     */
    getSourceArr () {
        return this._sourceArr;
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new FilePathResolve();
            this.instance._sourceArr = [];
            this.instance.fileDisplay(conf.dataRoot);

        }
        return this.instance;
    }
}
FilePathResolve.instance = null;
// export default FilePathResolve;

module.exports = FilePathResolve;