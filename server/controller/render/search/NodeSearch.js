var MercatorProjection = require('../../../utils/MercatorProjection.js');
var ResJson = require('../../../utils/ResJson.js');
var Search = require('./Search.js');

// import MercatorProjection from '../../../utils/MercatorProjection.js';
// import ResJson from '../../../utils/ResJson';
// import Search from "./Search";

class SearchNode extends Search {

    constructor(dirIndex, type) {
        super(dirIndex, type);
    }

    getByTileByMode(x, y, z, mode) {
        let self = this;
        let resJson = new ResJson();
        let trackTable = '';
        let photoTable = '';
        const wkt = MercatorProjection.getWktWithGap(x, y, z, 0);

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

            // -------此处需要改善
        }

        let sql = `select a.id as id, AsWKT(a.geometry) AS geometry from ${trackTable} a,  ${photoTable} b
                where a.id = b.id and Contains(GeomFromText('${wkt}'), a.geometry)`;
        const px = MercatorProjection.tileXToPixelX(x);
        const py = MercatorProjection.tileYToPixelY(y);

        return this.executeSql(sql).then(rows => {
            let dataArray = [];
            for (let i = 0; i < rows.length; i++) {
                if (rows[i].geometry) {
                    let snapShot = {
                        g: MercatorProjection.coord2Pixel(rows[i].geometry, px, py, z),
                        t: 1, // 表示点
                        i: rows[i].id,
                        m: {}
                    };
                    snapShot.m.a = rows[i].linkId;
                    dataArray.push(snapShot);
                }
            }
            let returnData = {};
            returnData.data = dataArray;
            returnData.type = self.type;
            return returnData;
        });
    }
}

module.exports = SearchNode;