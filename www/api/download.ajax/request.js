(client, callback) => {

    //client.context.data = client.data;
    
    var __client_data = JSON.parse(client.data);
    
    var __docs_files_path = client.hostDir+'/files/';  
    var __file_id = __client_data;
    __file_id = __file_id.file_id;
    var fileName = __docs_files_path + __file_id;
    //var fileName = 'example.png';
    
    client.res.setHeader('Content-Description', 'File Transfer');
	client.res.setHeader('Content-Type', 'application/x-download');
	client.res.setHeader('Content-Disposition', 'attachment; filename="'+__file_id + ' ' +fileName+'"');
	client.res.setHeader('Content-Transfer-Encoding', 'binary');
	client.res.setHeader('Expires', 0);
	client.res.setHeader('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');
	client.res.setHeader('Pragma', 'no-cache');

	//var filePath = client.hostDir+client.path+'/'+fileName;
        //var filePath = client.hostDir + '/' + fileName;

	fs.stat(fileName, function(err, stats) {
//            console.log('FS ERR:');
//            console.log(err);
//            console.log('------');
		if (err) client.error(404);
		else {
			client.res.setHeader('Content-Length', stats.size);
			fs.readFile(fileName, function(error, data) {
				if (error) client.error(404);
				else client.end(data);
				callback();
			});
		}
	});
        
};