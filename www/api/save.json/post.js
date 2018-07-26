(client, callback) => {

    if(true || client.logged) {
            api.queryBuilder.save(client, callback);
    }else{
        // not logged !!!
        client.context.data = {result: null, error: "Not logged."};
        callback();
    }

};