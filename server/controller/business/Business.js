var NewSqlite = require('../../sqliteConnect.js');
var ResJson = require('../../utils/ResJson.js');
var FilePathResolve = require('../../utils/FilePathResolve.js');

// import NewSqlite from './../../sqliteConnect.js';
// import ResJson from '../../utils/ResJson';
// import FilePathResolve from '../../utils/FilePathResolve';

var logger = require('../../../log4js').logger;

class Business {

    constructor(req, res) {
        this.res = res;
        let parm = JSON.parse(req.query.parameter);
        this.dirIndex = parm.dirIndex;
        const fileObjs = FilePathResolve.getInstance().getSourceArr();
        const fileObj = fileObjs[this.dirIndex];
        this.db = NewSqlite.getConnect(fileObj.sqlPath);
    }

    /**
     * 根据轨迹信息列表的额索引查询单个轨迹线以及对应的照片
     */
    getPhotosByIndex(mode) {
        try {
            let self = this;
            var resJson = new ResJson();
            let trackTable = '';
            let photoTable = '';

            if (mode === 'videomode') {
                trackTable = 'track_collection';
                photoTable = 'track_collection_photo';
            } else if (mode === 'photomode') {
                trackTable = 'track_contshoot';
                photoTable = 'track_contshoot_photo';
            } else {
                resJson.errmsg = 'mode参数有误！';
                resJson.errcode = -1;
                self.res.json(resJson);
            }

            let sql = `select a.id, AsGeoJSON(a.geometry) AS geometry, b.url,  b.shootTime
                    from  ${trackTable} a , ${photoTable} b where a.id = b.id order by a.recordTime `;

            this.db.spatialite(function (e) {
                if (!e) {
                    self.db.all(sql, function(err, rows) {
                        if (!err) {
                            var fileObjs = FilePathResolve.getInstance().getSourceArr();
                            var fileObj = fileObjs[self.dirIndex];
                            var data = {
                                node: rows,
                                baesPath: fileObj.baseDir,
                                flag: fileObj.flag,
                                dirIndex: self.dirIndex
                            };
                            resJson.data = data;
                        } else {
                            logger.error(e);
                            resJson.errmsg = err;
                            resJson.errcode = -1;
                        }
                        self.res.json(resJson);
                    });
                } else {
                    logger.error(e);
                    throw new Error(e);
                }
            });
        } catch (er) {
            logger.error(er);
            throw new Error(er);
        }
    }

    /**
     * 根据传入的值获取 当前点和前一个点以及后一个点。
     * 如果是第一个点的时候id为空，需要单独处理
     * @param {String} id 当前点的id
     * @param {String} mode 照片模式还是视频模式
     */
    getNodeDeatil(id, mode) {
        let trackTable = '';
        let photoTable = '';
        let resJson = new ResJson();
        let self = this;
        if (mode === 'videomode') {
            trackTable = 'track_collection';
            photoTable = 'track_collection_photo';
        } else if (mode === 'photomode') {
            trackTable = 'track_contshoot';
            photoTable = 'track_contshoot_photo';
        } else {
            resJson.errmsg = 'mode参数有误！';
            resJson.errcode = -1;
            self.res.json(resJson);
        }

        // this.db.all(' update track_collection set isView = 0 ');

        // 返回 当前点和前一个点以及后一个点。
        let innerSql = `select aa.recordTime from ${trackTable} aa , ${photoTable} bb where aa.id = bb.id and aa.id = '${id}' `;
        let wholeSql = `select id, shootTime, geometry, '' as url, '' as deviceNum from (select a.id,  a.recordTime, b.shootTime, AsGeoJSON(a.geometry) geometry from ${trackTable} a , ${photoTable} b where a.id = b.id and a.recordTime < ( ${innerSql} ) order by a.recordTime desc limit 1 ) temp1  
                    union all
                        select id, shootTime, geometry, url as url, deviceNum from (select a.id, a.recordTime, b.shootTime, AsGeoJSON(a.geometry) geometry, b.url, a.deviceNum from ${trackTable} a , ${photoTable} b where a.id = b.id and a.id = '${id}') temp            
                    union all
                        select id, shootTime, geometry, '' as url, '' as deviceNum  from (select a.id,  a.recordTime, b.shootTime, AsGeoJSON(a.geometry) geometry from ${trackTable} a , ${photoTable} b where a.id = b.id and a.recordTime > ( ${innerSql} ) order by a.recordTime limit 1) tmep2
                    `;
        if (!id) { // 当id为空是只返第一个和第二点
            wholeSql = ` select a.id, b.shootTime, AsGeoJSON(a.geometry) geometry, b.url, a.deviceNum from ${trackTable} a , ${photoTable} b where a.id = b.id order by a.recordTime  limit 2 `;
        }

        this.db.spatialite(function(er) {
            self.db.all(wholeSql, function(err, rows) {
                if (!err) {
                    resJson.data = rows;
                    self.updatePointStatue(id, trackTable, rows); // 修改当前点的是否查看的状态
                } else {
                    logger.error(err);
                    resJson.errmsg = err.message;
                    resJson.errcode = -1;
                }
                self.res.json(resJson);
            });
        });

    }

    /**
     *
     * @param {String} id 当前要参看的点
     * @param {String} trackTable 要查看的表
     * @param {Array} rows 查询的结果集
     */
    updatePointStatue(id, trackTable, rows) {
        if (!id) {
            id = rows[0].id;
        }
        let sql = `update ${trackTable} set isView = 1 where id = '${id}'`;
        this.db.all(sql);
    }
}

// export default Business;
module.exports = Business;
