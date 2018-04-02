var ResJson = require('../../utils/ResJson.js');
var SearchFactory = require('./search/SearchFactory.js');
var FilePathResolve = require('../../utils/FilePathResolve.js');
var NewSqlite = require('../../sqliteConnect.js');

// import ResJson from '../../utils/ResJson';
// import SearchFactory from './search/SearchFactory'

var logger = require('../../../log4js').logger;

class SearchNode {
    constructor(req, res, next) {
        this.req = req;
        this.res = res;
        this.next = next;
    }

    getObjByTile() {
        const self = this;
        const param = JSON.parse(this.req.query.parameter);
        let json = new ResJson();
        const promises = this._createPromises(param);
        Promise.all(promises).then(res => {
            for (let i = 0; i < res.length; i++) {
                json.data[res[i].type] = res[i].data;
            }
            self.res.json(json);
        }).catch(err => {
            json.errcode = -1;
            json.errmsg = err;
            self.res.json(json);
        })
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
            return Promise.reject("没有找到对应的查询解析器!");
        }
        return search.getByTileByMode(x, y, z, mode).catch(err => {
            logger.error(err);
        })
    }
}

// export default SearchNode;
module.exports = SearchNode;