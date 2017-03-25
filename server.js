
//Express
 var express = require("express");
 var app = express();

 /* serves main page */
 app.get("/", function(req, res) {
    res.sendfile('index.html')
 });

  app.post("/user/add", function(req, res) { 
	/* some server side logic */
	res.send("OK");
  });

 /* serves all the static files */
 app.get(/^(.+)$/, function(req, res){ 
     console.log('static file request : ' + req.params);
     res.sendfile( __dirname + req.params[0]); 
 });

 var port = process.env.PORT || 5000;
 app.listen(port, function() {
   console.log("Listening on " + port);
 });

///DB
var mongo = require('mongodb').MongoClient,
    client = require('socket.io').listen(8080).sockets;


    mongo.connect('mongodb://127.0.0.1/chat', function(err,db){

        if(err) throw err;

        //On Socket Connect
        client.on('connection', function(socket){

            var col = db.collection('messages'),
                    sendStatus = function(s) {
                        socket.emit('status',s)
                    };

        //Emit all messagess / sort 0 'asc' 1 'desc'
        // "sort": [['field1','asc'], ['field2','desc']]
        col.find().limit(100).sort({_id: 1}).toArray(function(err, res){
                if(err) throw err;

                socket.emit('output', res);
        });

        //wait fro socket
        socket.on('input', function(data){
                var name = data.name,
                    message = data.message,
                    WhiteSpacePattern = /^\s*$/;

                    if(WhiteSpacePattern.test(name) || WhiteSpacePattern.test(message))
                    {
                        sendStatus("Name and Message are required.");
                    }
                    else
                    {
                         col.insert({name:name,message:message},function(){

                            //Emit Latest message to All clients
                            client.emit('output',[data]);//round robin


                                sendStatus({
                                    message:"Message sent!",
                                    clear: true
                                });
                           });
                    }
            });
        });

    });

