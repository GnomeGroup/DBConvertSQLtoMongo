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
            let loadArray = [];
            if( !error && ( results.length > 0 ) )  {
              for( let i = 0; i < results.length; i++ )  {
                for( let x in results[i] )  {
                  if( thisTable.mapToBool && thisTable.mapToBool.includes( x ) )  {
                    results[i][x] = ( parseInt( results[i][x] ) == 1 )
                  }
                }
                loadArray.push( results[i] )
              }
            }
            let sendToMongo = () => {
              sendArray = loadArray.slice( 0, thisTable.batchSize );
              if( loadArray.length > thisTable.batchSize )  {
                loadArray = loadArray.slice( thisTable.batchSize );
              }  else {
                loadArray = []
              }
              if( sendArray.length > 0 )  {
                console.log(sendArray)
//                NK.db.insert( config.mongo.name, thisTable.name, sendArray, () => sendToMongo() );
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
