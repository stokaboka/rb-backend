(client, callback) => {

    if (true || client.logged) {
        var __files_path = 'files';

        //var __fs = impress.require('fs.extra');
        var __fs = api.fs.extra;
        var __path = impress.require('path');
        //var __ = impress.require('underscore');

        var __docs_files_path = client.hostDir + __path.sep + __files_path;

        var __target_field = '';
        var __files_mode = '';
        if (client.fields["target"])__target_field = client.fields["target"][0];
        if (client.fields["mode"][0])__files_mode = client.fields["mode"][0];

//    console.log("__target_field = "+__target_field);
//    console.log("__files_mode = "+__files_mode);

        var __dbName = application.config.agat.agat_db_name;
        var __database = application.databases[__dbName];

        var __errors = [];
        var __results = [];
        var __rows = [];

        if (typeof client.files === 'undefined' || client.files.length == 0) {
            __errors.push({error: 'empty files[]'});
            client.context.data = {results: __results, errors: __errors, rows: __rows};
            callback();
        } else {

            api._.each(client.files, function (__file) {
                try {
                    var ___file = __file[0];

                    var __row = {
                        "name": __path.basename(___file.path), "path": __files_path, "description": '', "id_document": 0, "original": ___file["originalFilename"], "content_type": ___file["headers"]["content-type"], "target_field": __target_field
                    };

                    __rows.push(__row);

                    var __to_file = __row["path"] + __path.sep + __row["name"];

                    __fs.copy(___file.path, __to_file, function (err) {
                        if (err) {
                            __errors.push(err);
                            client.context.data = {results: __results, errors: __errors, rows: __rows};
                            callback();
                        } else {
                            console.log("Copied " + ___file.path + " to " + __to_file);

                            var _insert = __database.connection.insert(
                                "files",
                                __row,
                                function (err, recordId) {
                                    if (err) {
                                        __errors.push(err);
                                        client.context.data = {results: __results, errors: __errors, rows: __rows};
                                        callback();
                                    } else {
                                        __results.push(__row);
                                        client.context.data = {results: __results, errors: __errors, rows: __rows};
                                        callback();
                                    }
                                });
                        }
                    });
                } catch (err) {
                    __errors.push(err);
                    client.context.data = {results: __results, errors: __errors, rows: __rows};
                    callback();
                }
            });
        }
    } else {
        client.context.data = {results: [], errors: ["Not logged!"], rows: []};
        callback();
    }
};