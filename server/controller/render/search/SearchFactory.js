import NodeSearch from './NodeSearch.js';
import LinkSearch from './LinkSearch.js';

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
        }

        return search;
    }
}

export default SearchFactory;