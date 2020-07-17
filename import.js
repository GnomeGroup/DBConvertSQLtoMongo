const NK = require( 'nk-node' )
const mysql = require( 'mysql' )
const mssql = require( 'mssql' )

const mySQLTransport = {
  obj: null,
  connect: ( configuration ) => {
    mySQLTransport.obj = mysql.createConnection( configuration )
    mySQLTransport.obj.connect(err => {
			if( err )	{
        mySQLTransport.obj = null
        console.log( err.sqlMessage )
			}
		})
  },
  query: ( sql, callback ) => {
    if( mySQLTransport.obj )  {
      mySQLTransport.obj.query( sql, ( error, results, fields ) => {
				let fieldAliases = []
				let fieldList = {}
				for( let i = 0; ( i < results.length ) && ( i < 1 ); i++ )	{
					for( let x in results[i] )	{
						fieldAliases.push( x )
					}
				}
        console.log( fieldAliases )
        process.exit()
				for( let i = 0; i < fields.length; i++ )	{
					fieldList[fieldAliases[i]] = fields[i].name
				}
				for( let i = 0; i < results.length; i++ )	{
					for( let x in results[i] )	{
						if( fieldList[x] && ( fieldList[x] != x ) )	{
              console.log( 'Set Name: ' + results[i][x] )
							results[i][fieldList[x]] = results[i][x]
							delete results[i][x]
						}
					}
				}
				callback( error? []: results )
			})
    } else {
      callback( [] )
    }
  },
  close: () => mySQLTransport.obj.end()
}

const msSQLTransport = {
  obj: null,
  connect: async ( configuration ) => {
    msSQLTransport.obj = await mssql.connect( 'mssql://' + escape( configuration.user ) + ':' + escape( configuration.password ) + '@' + escape( configuration.host ) + '/' + escape( configuration.database ) )
  },
  query: async ( sql, callback ) => {
    if( msSQLTransport.obj )  {
      let result = await mssql.query( sql )
      if( !result.err && result.res.recordsets )	{
  			callback( result.res.recordsets[0] )
      } else {
        callback( [] )
      }
    } else {
      callback( [] )
    }
  },
  close: () => {}
}

const configFileName = ( __dirname + '/config.json' )
if( !NK.files.exists( configFileName ) )  {
  NK.files.write( configFileName, NK.files.read( __dirname + '/default-config.json' ) )
}
const config = require( './config' )

const transporter = ( config.mysql? mySQLTransport: ( config.mssql? msSQLTransport: null ) )
const configObject = ( config.mysql? config.mysql: ( config.mssql? config.mssql: null ) )

if( config.enabled && transporter ) {
  NK.start( true, config.mongo.name, null, null, () => {
    transporter.connect( configObject )
    let tables = NK.objCopy( config.tables )
    let loadNextTable = () => {
      let thisTable = ( ( tables && ( tables.length > 0 ) )? tables.shift(): null )
      if( thisTable ) {
        NK.db.delete( config.mongo.name, thisTable.name, {}, () => {
          if( thisTable.copyData ) {
            transporter.query( ( 'SELECT * FROM ' + thisTable.name ), ( results ) => {
              let loadArray = []
              if( results.length > 0 )  {
                for( let i = 0; i < results.length; i++ )  {
                  for( let x in results[i] )  {
                    if( thisTable.mapToBool && thisTable.mapToBool.includes( x ) )  {
                      results[i][x] = ( parseInt( results[i][x] ) == 1 )
                    }
                  }
                  loadArray.push( results[i] )
                }
              }
              let counter = 0
              let sendToMongo = () => {
                sendArray = loadArray.slice( 0, thisTable.batchSize )
                if( loadArray.length > thisTable.batchSize )  {
                  loadArray = loadArray.slice( thisTable.batchSize )
                }  else {
                  loadArray = []
                }
                if( sendArray.length > 0 )  {
                  counter += sendArray.length
                  console.log( 'Added ' + counter + ' rows to ' + thisTable.name )
                  NK.db.insert( config.mongo.name, thisTable.name, sendArray, () => sendToMongo() )
                } else {
                  loadNextTable()
                }
              }
              sendToMongo()
            })
          } else {
            loadNextTable()
          }
        })
      } else {
        transporter.close()
        process.exit()
      }
    }
    loadNextTable()
  })
}
