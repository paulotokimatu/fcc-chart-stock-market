require('dotenv').config();
var path = require("path");
var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server);
var mongoose = require("mongoose");
var Comps = require("./models/comps.js");
var googleFinance = require('google-finance');

mongoose.Promise = Promise;
mongoose.connect(process.env.DB);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'commons')));

app.route("/").get((req, res) => {
    res.sendFile("index.html");
});

function getStock(client) {
    Comps.find({}).select("company -_id").exec((err, allComp) => {
        if (err) throw err;
        
        var symbols = [];
        for (var comp in allComp) {
            symbols.push(allComp[comp].company);
        }
        
        googleFinance.historical({
            symbols: symbols,
            from: '2016-01-01',
            to: '2017-08-30'
            }, function (err, quotes) {
                if (err) throw err;
                //Check if the Company is valid, if not delete from the database and return an error message
                for (var comp in quotes) {
                    //A company is not valid if no stock record was found
                    if (quotes[comp].length === 0) {
                        Comps.remove({company: comp}, (err) => {
                            if (err) throw err;
                            client.emit("invalidComp", 'The company ID "' + comp + '" is not valid.');
                        });
                        return;
                    }
                }
                client.emit("update", quotes);
                client.broadcast.emit("update", quotes);
            }
        );
    });
}

io.on("connection", function(client) {
    client.on("join", function(data) {
        getStock(client);
    });
    
    client.on("addComp", function(comp) {
        Comps.create({company: comp}, (err, newComp) => {
            if (err) throw err;
            getStock(client);
        });
    });
    
    client.on('deleteComp', function(comp) {
        Comps.remove({company: comp}, (err) => {
            if (err) throw err;
            getStock(client);
        });
    });
});

server.listen((process.env.PORT || 3000), () => {
    console.log("Server up");
});