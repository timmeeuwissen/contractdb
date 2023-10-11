import mysql from 'mysql2'
import config from './config.json'

let connection;
export default () => {
  if (connection) return connection

  connection = mysql.createConnection(config.connection)

  connection.connect((err) => {
    if (err) throw err
    console.log('Successfully connected to MySql Server');
  });

  return connection;
}
