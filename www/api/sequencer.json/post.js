(client, callback) => {

    if(true || client.logged) {
        try {
            var __client_data = JSON.parse(client.data);
            if(__client_data.database) {

                var __database = application.databases[__client_data.database];

                if (__client_data.sequence && __client_data.action) {

                    var __sequence_id = __client_data.sequence;

                    var query = __database.connection.query(
                        "SELECT sequencer(?, 'NEXTVAL') as `value` FROM dual", [__sequence_id],
                        function (err, result) {
                            client.context.data = {result: result, error: err, total_rows: 1};
                            callback();
                        });

                }
            }else{
                application.log.error("Database not specified.");
                client.context.data = {result: null, error: "Database not specified."};
                __callback();
            }

        } catch (err) {
            client.context.data = {result: null, error: err};
            callback();
        }
    }else{
        // not logged !!!
        client.context.data = {result: null, error: "Not logged."};
        callback();
    }
}