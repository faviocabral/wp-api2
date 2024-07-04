//conexion del orm 
const knex_pg = require("knex")({
    client: 'pg',
    connection: {
      host : "localhost",
      port : 5432,
      user : "",
      password : '',
      database : ""
    }
  });

module.exports = knex_pg