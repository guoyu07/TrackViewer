var ResJson = require('../../utils/ResJson.js');
var SearchFactory = require('./search/SearchFactory.js');
var FilePathResolve = require('../../utils/FilePathResolve.js');
var NewSqlite = require('../../sqliteConnect.js');
var dateFormat = require('dateformat');

// import ResJson from '../../utils/ResJson';
// import SearchFactory from './search/SearchFactory'

var logger = require('../../../log4js').logger;

// var indes = 0;

class SearchNode {
    constructor(req, res, next) {
        this.req = req;
        this.res = res;
        this.next = next;
    }

    getObjByTile() {
        // indes++;
        // var indexs = indes;
        // logger.error(indexs + '进入：' + dateFormat(new Date(), 'yyyy-mm-dd hh:MM:ss l'));
        const self = this;
        const param = JSON.parse(this.req.query.parameter);
        let dirIndex = param.dirIndex;
        let mode = param.mode;
        let json = new ResJson();
        if (!(dirIndex != undefined && dirIndex != null && mode)) {
            json.data = { 'TRACKLINK': [], 'TRACKPOINT': []};
            this.res.json(json);
            return;
        }
        const promises = this._createPromises(param);
        Promise.all(promises).then(res => {
            // logger.error(indexs + '退出：' + dateFormat(new Date(), 'yyyy-mm-dd hh:MM:ss  l'));
            for (let i = 0; i < res.length; i++) {
                json.data[res[i].type] = res[i].data;
            }
            self.res.json(json);
        }).catch(err => {
            json.errcode = -1;
            json.errmsg = err;
            self.res.json(json);
        });
    }

    _createPromises(param) {
        const types = param.types;
        const promises = [];
        for (let i = 0; i < types.length; ++i) {
            const promise = this._createAjaxPromise(types[i], param);
            promises.push(promise);
        }

        return promises;
    }

    _createAjaxPromise(type, param) {
        const {
            dirIndex,
            mode,
            x,
            y,
            z
        } = param;
        const searchFactory = new SearchFactory();
        const search = searchFactory.createSearch(dirIndex, type);
        if (!search) {
            return Promise.reject('没有找到对应的查询解析器!');
        }
        return search.getByTileByMode(x, y, z, mode).catch(err => {
            logger.error(err);
        });
    }
}

// export default SearchNode;
module.exports = SearchNode;