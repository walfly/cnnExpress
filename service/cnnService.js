const fetch = require('isomorphic-fetch');
const cache = {};
const getCacheKey = () => {
    const date = new Date();
    date.setMinutes(0);
    date.setSeconds(0);
    return date.getTime();
};
const shouldFetch = (key, prop) => {
    return cache.key !== key || !cache[prop];
};

module.exports = {
    full() {
        const key = getCacheKey();
        if (shouldFetch(key, 'full')) {
            cache.key = key;
            return fetch("http://data.cnn.com/ELECTION/2016/full/P.full.json")
                    .then(res => { return res.json()})
                    .then(json => {
                        cache.full = json;
                        json.wfLastUpdated = key;
                        return json;
                    });
        } else {
            return new Promise(resolve => {
                resolve(Object.assign({}, cache.full, {wfLastUpdated: key}));
            });
        }
    },
    partial() {
        const key = getCacheKey();
        if (shouldFetch(key, 'partial')) {
            cache.key = key;
            return fetch("http://data.cnn.com/ELECTION/2016/bop/p.json")
                    .then(res => { return res.json()})
                    .then(json => {
                        const dem = json.candidates.find(cand => {
                            return cand.party === 'D';
                        });
                        const rep = json.candidates.find(cand => {
                            return cand.party === 'R';
                        });
                        if(Number(dem.cvotes.replace(/,/g, '')) < 64223958) {
                            dem.cvotes = '64,223,958';
                            rep.cvotes = '62,206,395';
                            json.candidates = [dem, rep];
                        }
                        cache.partial = json;
                        json.wfLastUpdated = key;
                        return json;
                    });
        } else {
            return new Promise(resolve => {
                resolve(Object.assign({}, cache.partial, {wfLastUpdated: key}));
            });
        }
    }
}
