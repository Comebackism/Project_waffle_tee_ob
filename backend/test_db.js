const db = require('./config/db'); db.query('SELECT * FROM "Menu"').then(res => console.log(res.rows));
