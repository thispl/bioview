const MySQLEvents = require('@rodrigogs/mysql-events');

var mysql = require('mysql');
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "biosecurity"
});
var path = require('path');
var http = require('http');
var fs = require('fs');



const program = async() => {
    const instance = new MySQLEvents({
        host: 'localhost',
        user: 'root',
        password: 'password',
    }, {
        startAtEnd: true,
    });

    await instance.start();

    instance.addTrigger({
        name: 'Changes in Transaction',
        expression: '*.acc_transaction',
        statement: MySQLEvents.STATEMENTS.INSERT,
        onEvent: (event) => {
            instance.on(MySQLEvents.EVENTS.BINLOG, (log) => {
                if (log['rows']) {
                    log['rows'].forEach(function(row) {
                        var pin = row.after['pin'];
                        con.connect(function(err) {
                            if (err) throw err;
                            con.query("SELECT photo_path FROM pers_person WHERE pin=" + mysql.escape(pin), function(err, result, fields) {
                                if (err) throw err;
                                Object.keys(result).forEach(function(key) {
                                    var row = result[key];
                                    photo_path = path.join("C:\\\Program Files\\BioSecurity\\service\\zkbiosecurity\\BioSecurityFile", row.photo_path)
                                    http.createServer(function(req, res) {
                                        // fs.readFile('index.html', function(err, data) {
                                        res.writeHead(200, { 'Content-Type': 'text/html' });
                                        res.write(data);
                                        return res.end();
                                        // });
                                    }).listen(8080);
                                });
                            });
                        });
                    });
                }
            })
        },
    });

    instance.on(MySQLEvents.EVENTS.CONNECTION_ERROR, console.error);
    instance.on(MySQLEvents.EVENTS.ZONGJI_ERROR, console.error);
};

program()
    .then(() => console.log('Waiting for database events...'))
    .catch(console.error);