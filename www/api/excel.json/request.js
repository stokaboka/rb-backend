(client, callback) => {

	api.queryBuilder.select(client, function () {
		api.excelBuilder.dataToXLSX(client, function () {
			var __file_id = client.context.data.xlsx_file_id;
			var __file = client.context.data.xlsx_file_path + client.context.data.xlsx_file_name;
			var __file_name = client.context.data.xlsx_file_name;

			client.res.setHeader('Content-Description', 'File Transfer');
			client.res.setHeader('Content-Type', 'application/x-download');
			//client.res.setHeader('Content-Disposition', 'attachment; filename="'+__file_id + ' ' +__file_name+'"');
			client.res.setHeader('Content-Disposition', 'attachment; filename="'+__file_name+'"');
			client.res.setHeader('Content-Transfer-Encoding', 'binary');
			client.res.setHeader('Expires', 0);
			client.res.setHeader('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');
			client.res.setHeader('Pragma', 'no-cache');

			api.fs.stat(__file, function(err, stats) {
				if (err){
					console.log('FS ERR:');
					console.log(err);
					console.log('------');
					client.error(404);
				}else {
					client.res.setHeader('Content-Length', stats.size);
					api.fs.readFile(__file, function(error, data) {
						if (error) client.error(404);
						else client.end(data);
						callback();
					});
				}
			});
		});
	});
}