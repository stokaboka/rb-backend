(client, callback) => {

	application.security.register(client, client.fields.Password, client.fields.Email, function(err, user) {
		if (user) client.context.data = { Result: "OK" };
		else client.context.data = { Result: "Error" };
		callback();
	});
}