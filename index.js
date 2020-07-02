const NK = require( "nk-node" );
const mysql = require( "mysql" );
const configFileName = ( __dirname + "/config.json" );
if( !NK.files.exists( configFileName ) )  {
  NK.files.write( configFileName, NK.files.read( __dirname + "/default-config.json" ) );
}
const config = require( "./config" );

if( config.enabled ) {
NK.start( true, null, null, null, () => NK.db.start( config.mongo.name, config.mongo.host, config.mongo.port, () => {
  let mySQLConnection = mysql.createConnection( config.mysql );
  mySQLConnection.connect();
  let tables = NK.objCopy( config.tables );
  let loadNextTable = () => {
    let thisTable = ( ( tables && ( tables.length > 0 ) )? tables.shift(): null );
    if( thisTable ) {
      if( thisTable.copyData ) {
        mySQLConnection.query( ( "SELECT * FROM " + thisTable.name ), ( error, results, fields ) => {
          console.log(error, results, fields);
          //for each table, get all rows
          let loadArray = [];


          let sendToMongo = () => {
            let sendArray = NK.objCopy( loadArray );
            if( loadArray.length > thisTable.batchSize )  {
              sendArray = loadArray.slice( 0, thisTable.batchSize );
              loadArray = loadArray.slice( thisTable.batchSize );
            }
            if( sendArray.length > 0 )  {
              NK.db.insert( config.mongo.name, thisTable.name, sendArray, () => sendToMongo() );
            } else {
              loadNextTable();
            }
          };
          sendToMongo();
        });
      } else {
        loadNextTable();
      }
    } else {
      mySQLConnection.end();
    }
  };
  loadNextTable();
}));
};
//add ability for SQLLite and MSSQL
