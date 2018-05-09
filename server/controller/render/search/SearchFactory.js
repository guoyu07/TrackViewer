var NodeSearch = require('./NodeSearch.js');
var LinkSearch = require('./LinkSearch.js');

// import NodeSearch from './NodeSearch.js';
// import LinkSearch from './LinkSearch.js';

class SearchFactory {
    constructor() {
    }

    createSearch(dirIndex, type) {
        let search = null;
        switch (type) {
            case 'TRACKPOINT':
                search = new NodeSearch(dirIndex, type);
                break;
            case 'TRACKLINK':
                search = new LinkSearch(dirIndex, type);
                break;
            default:
                break;
        }

        return search;
    }
}

// export default SearchFactory;
module.exports = SearchFactory;