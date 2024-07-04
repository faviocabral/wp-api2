//conexion del orm 
const knex = require("knex")({
    client: 'mssql',
    connection: {
      host : "" ,
      user : '',
      password : '',
      database : ''
    }
  });

module.exports = knex