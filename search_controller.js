const db = require('./db.js');

function search(req, res, next) {
    db.getAllEntries()
    .then(result => res.send(result.rows))
    .catch(error => res.send(error))
}

module.exports = {
	search: search
};