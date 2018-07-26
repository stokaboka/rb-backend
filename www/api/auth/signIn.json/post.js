(client, callback) => {
    
    if(client.fields.Login === 'demo' && client.fields.Password === 'demo'){
        client.context.data = { Result: "OK", SID: 'RedButtonDemo_'+Math.round(Math.random()*1000000000).toString(), group: 'demo', login: client.fields.Login };
    }else{
        application.security.signIn(client, client.fields.Login, client.fields.Password, function(isSuccess) {
            if (isSuccess){
                client.context.data = { Result: "OK", SID: client.session.sid, group: client.session.group, login: client.session.login };
            }else{
                client.context.data = { Result: "Error", SID: '', isSuccess: isSuccess};
            }
        });
    }
    callback();
}

// (client, callback) => {
//
//     application.security.signIn(client, client.fields.Login, client.fields.Password, function(isSuccess) {
//         	if (isSuccess){
//                        client.context.data = { Result: "OK", SID: client.session.sid, group: client.session.group, login: client.session.login };
//                    }else{
//                        client.context.data = { Result: "Error", SID: '', isSuccess: isSuccess};
//                    }
//         	callback();
//     });
//
// }