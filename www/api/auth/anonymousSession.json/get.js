(client, callback) => {
	client.startSession();
	callback({ SID: client.sid });
}