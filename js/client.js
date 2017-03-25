(function(){

        var getNode = function(s)
        {
            return document.querySelector(s);
        },
        //Get Required nodes
        status   = getNode('.chat-status span'),
        messages = getNode('.chat-messages'),
        textarea = getNode('.chat-textarea'),
        chatName = getNode('.chat-name'),
        statusDefault = status.textContent,
        setStatus = function(s){
            status.textContent = s;

            if(s != statusDefault)
                var delay = setTimeout(function(){
                    setStatus(statusDefault);
                    clearInterval(delay);
                }, 3000);
        };


        try{
            var socket = io.connect('http://127.0.0.1:8080');
        } catch(e)
        {
            //set status to warn user
            setStatus('Faild to connect to the server, try again later!');
        }

        if(socket !== undefined)
        {

            //Listen for output

            socket.on('output',function(data){
                if(data.length)
                {
                    //loop throw result
                    for( var x = 0 ; x < data.length; x = x + 1 )
                    {
                        var message = document.createElement('div');
                            message.setAttribute('class','chat-message');
                            message.textContent = data[x].name + ': ' + data[x].message;

                            //Append
                            messages.appendChild(message);
                            messages.insertBefore(message, messages.firstChild);
                    }
                    
                }
            });

            //listen for status
            socket.on('status',function(data){

                setStatus( (typeof data === 'object') ? data.message : data );

                    if(data.clear === true)
                    {
                        textarea.value = '';
                    }
            });
            
           //listen for keydown
           textarea.addEventListener('keydown',function(event){
               var self = this,
                    name = chatName.value;

                    if(event.which === 13 && event.shiftKey === false)
                    {
                        //Send
                      socket.emit('input',
                               { name:name, message: self.value });

                        event.preventDefault();
                    }
           });
        }

    })();
