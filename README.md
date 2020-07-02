# MySQL-to-MongoDB-Importer
Import the full contents of any MySQL database into MongoDB


How to use:

1. make a project and install this repo
#npm init ; npm i mysql-to-mongodb-importer --save
2. Create a config.json file (or one will be auto created on first run), using the data from defaut-config.json
#cp defaut-config.json config.json
3. Edit the file to include the server connection information for the MySQL and Mongo as well the list of tables to import following the example.
4. Run your node to import and watch the console
#npm start