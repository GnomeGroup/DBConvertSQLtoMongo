# M(yS)SQL-to-MongoDB-Importer

Import the full contents of any M(yS)SQL database into MongoDB in just 4 steps, no licenses.

## Installation

This library uses nodeJS to install and run, please ensure your system is first installed and configured.

```bash
mkdir /root/importer
cd /root/importer
git clone https://github.com/Encke/MySQL-to-MongoDB-Importer .
npm i
```

## Usage:

Create a config.json file, using the data from defaut-config.json

```bash
cp defaut-config.json config.json
```

Once you have the file, please edit the MongoDB Conenction information as well as the SOURCE DATABASE object, if you want to change the driver from MySQL to MSSQL or vice-versa, change the name of the element from mysql to mssql

```json
"mssql": {
  "host": "localhost",
  "user": "billy",
  "password": "myGr3@tP@s$w0rd",
  "database": "webDATA"
}
```

Then edit the tables, adding a new element for each table you wish to import. There is only one manual mapping needed, which is the BIT / TINYINT(1) to BOOLEAN ... this must be done in the table line in the element named mapToBool, place all the field names there and they will be mapped from INT to BOOL.

```json
"mapToBool": [ "field1", "field2", "is_active" ]
```

## Running the import:

Please note: all destination tables will be CLEARED before importing, in the event you need to run the process multiple times, it will automatically delete the data prior to importing into the tables.

```bash
npm start
```

That's it!

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)