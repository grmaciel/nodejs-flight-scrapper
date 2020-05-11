const { Client } = require('pg');

class DB {
    connect() {
        this.client = new Client({
            connectionString: process.env.DATABASE_URL
        });
        this.client.connect();
        this.createDB();
    }

    createDB() {
        // TODO move this crap away from here
        this.client.query(`CREATE TABLE IF NOT EXISTS 
        flight_search(
            id SERIAL PRIMARY KEY, 
            chat_id VARCHAR(60) not null, 
            departure VARCHAR(60) not null, 
            destination VARCHAR(60) not null, 
            dateFrom VARCHAR(60) not null, 
            dateTo VARCHAR(60) not null, 
            minDays VARCHAR(60) not null,
            maxDays VARCHAR(60) not null
            );`
        )
    }

    save(chatId, departure, destination, dateFrom, dateTo, minDays, maxDays) {
        try {
            // TODO IDENTIFY WHAT ARE THESE
            const command = "INSERT INTO flight_search VALUES(nextval('flight_search_id_seq'), $1, $2, $3, $4, $5, $6, $7) RETURNING id";
            const values = [chatId, departure, destination, dateFrom, dateTo, minDays, maxDays];

            let res = this.client.query(command, values);
            console.log("res " + res);
            console.log("res " + res.id);
            // console.log("res.rows " + res.rows);
            // console.log(res.rows[0]);
            return res.id;
        } catch (err) {
            console.log(err.message);
            return -1;
        }
    }

    getAllEntries() {
        // TODO put it in a transation
        const query = "SELECT * FROM FLIGHT_SEARCH";
        return this.client.query(query);
    }

    getChatIdById(id) {
        console.log('querying for id', id)
        const query = "SELECT chat_id FROM FLIGHT_SEARCH WHERE ID = $1";
        let result = this.client.query(query, [id]);

        return result;
    }

    deleteById(id) {
        console.log('querying for id', id)
        const query = "DELETE FROM FLIGHT_SEARCH WHERE ID = $1";
        this.client.query(query, [id]);
    }
}

// create sequence flight_search_seq;
// create table flight_search (id integer not null default nextval('flight_search_seq'), chat_id integer not null, departure varchar not null, destination varchar not null, date_from date not null, date_to date not null, min_days integer not null, max_days integer not null);
// ALTER SEQUENCE flight_search_seq OWNED BY flight_search.id;

// insert into flight_search values (nextval('flight_search_seq'), 'berlin', 'Navegantes', '2019-08-01', '2020-05-01', 10, 30);
// SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_NAME = 'flight_search';

// ALTER SEQUENCE flight_search_seq RESTART WITH 1;
// UPDATE t SET idcolumn=nextval('seq');
module.exports = new DB();