(client, callback) => {

	client.context.data = { Result: "OK" };
    if(client.fields.Login === 'demo' && client.fields.Password === 'demo'){
        callback();
    } else {
        application.security.signOut(client, callback);
    }

};