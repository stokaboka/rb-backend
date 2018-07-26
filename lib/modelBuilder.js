/**
 * Created by stokaboka on 27.10.2016.
 */

api.modelBuilder = {};


api.modelBuilder.config =
	{
		check_user_logged: false
	};

api.modelBuilder.db_api_valid =
	{
    schema: "mysql, oracle, pgsql",
    action: "databases, tables, views, columns, indexes"
};

api.modelBuilder.model_container =
	{
    ext: ".json",
    static_dir: "static",
    models_dir: "models",
    model_index_file: "model.json",
    model_datasources_dir: "ds",
	model_forms_dir: "forms"
};

api.modelBuilder.db_api =
	{
    mysql: {
        tables: {
            statement: "SELECT table_name, table_comment COMMENTS FROM INFORMATION_SCHEMA.TABLES WHERE table_schema = ? AND TABLE_TYPE IN ('BASE TABLE', 'VIEW')",
            values: ["schema"], bind_variables: true
        },
        views:  {
            statement: "SELECT table_name, table_comment COMMENTS FROM INFORMATION_SCHEMA.TABLES WHERE table_schema = ? AND TABLE_TYPE='VIEW'",
            values: ["schema"], bind_variables: true
        },
        columns: {
            statement: "SELECT COLUMN_NAME, DATA_TYPE, case when CHARACTER_MAXIMUM_LENGTH IS NOT NULL THEN CHARACTER_MAXIMUM_LENGTH when DATETIME_PRECISION IS NOT NULL THEN DATETIME_PRECISION when NUMERIC_PRECISION  IS NOT NULL THEN NUMERIC_PRECISION else null end as DATA_PRECISION, case when NUMERIC_SCALE IS NOT NULL THEN NUMERIC_SCALE else null end as DATA_SCALE, IS_NULLABLE, COLUMN_KEY, EXTRA, COLUMN_COMMENT COMMENTS FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ? AND TABLE_SCHEMA = ?",
            values: ["table", "schema"], bind_variables: true
        },
        indexes: {
            // TABLE, NON_UNIQUE, KEY_NAME, SEQ_IN_INDEX, COLUMN_NAME, COLLATION, CARDINALITY, SUB_PART, PACKED, NULL, INDEX_TYPE, COMMENT, INDEX_COMMENT
            statement: "SHOW INDEX FROM ? FROM ?",
            values: ["table", "schema"], bind_variables: false
        },
	    sequences: {
		    statement: "SELECT `id`, `value` FROM agat.sequences",
		    values: [], bind_variables: false
        },
        references: {
            statement: "SELECT CONSTRAINT_NAME, TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME, " +
            "REFERENCED_TABLE_SCHEMA, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME " +
            "      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE " +
            "      WHERE REFERENCED_TABLE_SCHEMA IS NOT NULL AND TABLE_SCHEMA=? AND REFERENCED_TABLE_SCHEMA=?",
            values: ["schema", "schema"], bind_variables: true
        }
    },
    oracle: {
        tables: {
            statement: "SELECT user_tables.table_name, decode(COMMENTS, NULL, ' ', COMMENTS) COMMENTS FROM user_tables left outer join USER_TAB_COMMENTS on user_tables.table_name = USER_TAB_COMMENTS.table_name",
            values: null, bind_variables: true
        },
        views: {
            statement: "SELECT view_name table_name, null COMMENTS FROM user_views",
            values: null, bind_variables: true
        },
        // DATA_LENGTH - длина типа данных, для  - NUMBER действительно DATA_PRECISION и DATA_SCALE
        // DATA_PRECISION - максимальная допустимая длина значения столбца - NUMBER
        // DATA_SCALE -точность (число десятичных знаков) значения столбца - NUMBER
        columns: {
            statement: "select USER_TAB_COLUMNS.COLUMN_NAME, DATA_TYPE, DATA_LENGTH, DATA_PRECISION, DATA_SCALE, NULLABLE IS_NULLABLE, COMMENTS from USER_TAB_COLUMNS left outer join USER_COL_COMMENTS on USER_TAB_COLUMNS.TABLE_NAME = USER_COL_COMMENTS.TABLE_NAME and USER_TAB_COLUMNS.COLUMN_NAME = USER_COL_COMMENTS.COLUMN_NAME WHERE nls_upper(USER_TAB_COLUMNS.TABLE_NAME) = :0",
            values: ["table"], bind_variables: true
        },
        indexes: {
            statement: "select INDEX_NAME, index_type, UNIQUENESS from USER_INDEXES where TABLE_NAME = :0",
            values: ["table"], bind_variables: true
        },
	    sequences: {
		    statement: "select t.SEQUENCE_NAME id, t.LAST_NUMBER value, t.* from USER_SEQUENCES t",
		    values: [], bind_variables: false
	    },
        references: {
            statement: "SELECT CONSTRAINT_NAME, TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME, " +
            "REFERENCED_TABLE_SCHEMA, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME " +
            "      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE " +
            "      WHERE REFERENCED_TABLE_SCHEMA IS NOT NULL AND TABLE_SCHEMA=? AND REFERENCED_TABLE_SCHEMA=?",
            values: ["schema", "schema"], bind_variables: true
        }
    },
    mongodb: {
        tables: {},
        views: {},
        columns: {},
        indexes: {}
    },

	/*

	 select (t.table_schema || '.' || t.table_name) AS table_name,
	 (select pg_catalog.obj_description(oid) from pg_catalog.pg_class c where c.relname=t.table_name) as table_comment
	 from information_schema.TABLES t
	 WHERE t.TABLE_TYPE IN ('BASE TABLE', 'VIEW')
	 WHERE cols.table_catalog = 'agat'
	 AND ( table_schema || '.' || table_name ) = 'planning.equipment'

	 */

	pgsql: {
		tables: {
			statement:  "SELECT (t.table_schema || '.' || t.table_name ) AS table_name, " +
						"   (select pg_catalog.obj_description(oid) from pg_catalog.pg_class c where c.relname=t.table_name) AS COMMENTS, " +
						" t.TABLE_TYPE " +
						" FROM information_schema.TABLES t " +
						" WHERE t.TABLE_TYPE IN ('BASE TABLE', 'VIEW') " +
						" AND  t.table_catalog = $1 " +
						" AND  t.table_schema NOT IN ('information_schema', 'pg_catalog')",
			values: ["schema"],
			bind_variables: true
		},
		views:  {
			statement:  "SELECT (t.table_schema || '.' || t.table_name ) AS table_name, " +
						"   (select pg_catalog.obj_description(oid) from pg_catalog.pg_class c where c.relname=t.table_name) AS COMMENTS, " +
						" t.TABLE_TYPE " +
						" FROM information_schema.TABLES t " +
						" WHERE t.TABLE_TYPE IN ('BASE TABLE', 'VIEW') " +
						" AND  t.table_catalog = $1 " +
						" AND  t.table_schema NOT IN ('information_schema', 'pg_catalog')",
			values: ["schema"],
			bind_variables: true
		},
		columns: {
			statement:  "SELECT cols.COLUMN_NAME, cols.DATA_TYPE, " +
						"   case when cols.CHARACTER_MAXIMUM_LENGTH IS NOT NULL THEN cols.CHARACTER_MAXIMUM_LENGTH " +
						"   when cols.DATETIME_PRECISION IS NOT NULL THEN cols.DATETIME_PRECISION " +
						"   when cols.NUMERIC_PRECISION  IS NOT NULL THEN cols.NUMERIC_PRECISION " +
						"   else null end as DATA_PRECISION, " +
						"   case when cols.NUMERIC_SCALE IS NOT NULL THEN cols.NUMERIC_SCALE " +
						"   else null end as DATA_SCALE, " +
						"   cols.IS_NULLABLE, " +
						"   NULL AS COLUMN_KEY, " +
						"   NULL AS EXTRA, " +
						"   (select pg_catalog.col_description(oid,cols.ordinal_position::int) from pg_catalog.pg_class c where c.relname=cols.table_name) as COMMENTS " +
						"   FROM information_schema.columns cols " +
						"   WHERE cols.table_catalog = $1 " +
						"       AND ( table_schema || '.' || table_name ) = $2",
			values: ["schema", "table"],
			bind_variables: true
		},
		indexes: {
			statement:  "SELECT "+
						"   tc.constraint_name, tc.table_name, kcu.column_name, " +
						"   ccu.table_name AS foreign_table_name, " +
						"   ccu.column_name AS foreign_column_name " +
						"FROM " +
						"   information_schema.table_constraints AS tc " +
						"   JOIN information_schema.key_column_usage AS kcu " +
						"       ON tc.constraint_name = kcu.constraint_name " +
						"   JOIN information_schema.constraint_column_usage AS ccu " +
						"       ON ccu.constraint_name = tc.constraint_name " +
						"WHERE constraint_type = 'FOREIGN KEY' " +
						"   AND tc.constraint_catalog = $1 " +
						"   AND ( tc.table_schema || '.' || tc.table_name ) = $2",
			values: ["schema", "table"],
			bind_variables: true
		},
		sequences: {
			statement: "SELECT sequence_schema || '.' || sequence_name AS id, 0 AS value * FROM information_schema.sequences",
			values: [],
			bind_variables: false
		},
        references: {
            statement: "SELECT CONSTRAINT_NAME, TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME, " +
            "REFERENCED_TABLE_SCHEMA, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME " +
            "      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE " +
            "      WHERE REFERENCED_TABLE_SCHEMA IS NOT NULL AND TABLE_SCHEMA=? AND REFERENCED_TABLE_SCHEMA=?",
            values: ["schema", "schema"], bind_variables: true
        }
	}
};

api.modelBuilder.front = function(__client, __callback){

    var __builder = {
        id: "modelBuilder",
        version: "0.0.0",
        result: false,
        message: ''
    };

    application.log.debug("__client.data=");
    application.log.debug(__client.data);

    var __client_data = JSON.parse(__client.data);


    switch (__client_data.action){
        case "databases" :
            __client.context.data = api.modelBuilder.getDatabases();
            __callback();
            break;
        case "tables" :
        case "views" :
        case "columns" :
        case "indexes" :
	    case "sequences" :
        case "references" :
            api.modelBuilder.getSchemaInfo(__client_data, __client, __callback);
            break;
        case "loadModel" :
            api.modelBuilder.loadModel(__client_data, __client, __callback);
            break;
        case "saveModel" :
            api.modelBuilder.saveModel(__client_data, __client, __callback);
	        break;
	    case "deleteModel" :
		    api.modelBuilder.deleteModel(__client_data, __client, __callback);
	    case "indexModel" :
            api.modelBuilder.indexModel(__client_data, __client, __callback);
            break;
        case "squid" :
            api.modelSquidAnalyzer.parseLog(__client);
            __client.context.data = "SQUID ANALYZER STARTED";
            __callback();
            break;
        default:
            __builder.result = false;
            __builder.message = "[action] keyword expected";
            __client.context.data = __builder;
            __callback();
    }
};

api.modelBuilder.getBindVariableValue = function () {
    
};

api.modelBuilder.getDatabases = function () {
    var __list = api._.map(application.databases, function (__db, __db_key) {
        return {"name": __db_key, "schema": __db.schema, "security": __db.security};
    });

    return {result: __list, action: "databases"};

};

api.modelBuilder.getSchemaInfo = function ( __options, __client, __callback )
{
    var __out = [];
    var __database = application.databases[__options.database];
    var __database_name = "";

    //console.log('1 ************************************** ' + __database.schema);

    switch (__database.schema){
        case "mysql" :
            __database_name = __database.connection.config.database;
            break;
        case "pgsql" :
	        __database_name = __database.connection.connectionParameters.database;
            //console.log(__database.connection.connectionParameters.database);
	        break;
	    case "oracle" :
            break;
        case "mongodb" :
            // console.log("*** mongodb");
            // console.trace(__database.connection.s);
            __database_name = __database.connection.s.databaseName;
	    /**
         * TODO раскоментировать //break; после отладки mongodb драйвера
	     */
	    //break;
        default :
            application.log.error("Scheme [" + __database.schema + "] not supported 1");
            __client.context.data = {result: [], error: "Scheme [" + __database.schema + "] not supported 2. Valid schemes: " + api.modelBuilder.db_api_valid.schema};
            __callback();
            return;
    }

    var __bind_variables_value = {
        "action": __options.action,
        "schema": __database_name,
        "table":  __options.hasOwnProperty("table") ? __options.table : ''
    };


    if(api.modelBuilder.db_api.hasOwnProperty(__database.schema)){

        if(api.modelBuilder.db_api[__database.schema].hasOwnProperty(__options.action)){

            var __query_statement   = api.modelBuilder.db_api[ __database.schema ][ __options.action ].statement;
            var __where_values      = api.modelBuilder.db_api[ __database.schema ][ __options.action ].values;
            var __bind_variables    = api.modelBuilder.db_api[ __database.schema ][ __options.action ].bind_variables;

            var __where_values_data = [];
            if (__where_values) {
                if (__bind_variables) {
                    /**
                     * generate bind variables
                     */
                    __where_values_data = api._.map(__where_values, function (___w_v) {
                        return __bind_variables_value[___w_v];
                    })

                } else {
                    /**
                     * generate query with clear variables
                     */
                    var ___n = 0;
                    while(__query_statement.indexOf("?") >= 0){
                        var __bind_value =  __where_values[___n++];
                        if(__bind_value) {
                            __query_statement = __query_statement.replace("?", __bind_variables_value[__bind_value]);
                        }
                    }

                }
            }
            console.log("__query_statement: " + __query_statement);
            console.log("__where_values_data: " + __where_values_data);
            api.queryBuilder.select(__client, function(){
                __client.context.data["action"] = __options.action;
                __callback();
            }, {result: true, select: __query_statement, where_values: __where_values_data} );

        }else{
            application.log.error("Action [" + __options.action + "] not supported 3");
            __client.context.data = {result: [], error: "Action [" + __options.action + "] not supported 4. Valid action: " + api.modelBuilder.db_api_valid.action};
            __callback();
        }

    }else{
        application.log.error("Scheme [" + __database.schema + "] not supported 5");
        __client.context.data = {result: [], error: "Scheme [" + __database.schema + "] not supported 6. Valid schemes: " + api.modelBuilder.db_api_valid.schema};
        __callback();
    }

};


api.modelBuilder.loadModel = function ( __options, __client, __callback )
{

    if (!api.modelBuilder.config.check_user_logged || client.logged) {

        var __app_dir = __client.application.dir;

        var api_fs = api.fs;
        var api_fs_extra = api["fs.extra"];
        var api_path = api.path;

        var __model_path = api_path.join(__app_dir, api.modelBuilder.model_container.static_dir, api.modelBuilder.model_container.models_dir, __options.model.id);
        __model_path = api_path.normalize(__model_path);

        var __model_file = api_path.join(__model_path, api.modelBuilder.model_container.model_index_file);
        __model_file = api_path.normalize(__model_file);

        var __datasources_path = api_path.join(__model_path, api.modelBuilder.model_container.model_datasources_dir);
        __datasources_path = api_path.normalize(__datasources_path);

	    var __datasorces_relative_path = "/" + api.modelBuilder.model_container.models_dir + "/" + __options.model.id + "/" +  api.modelBuilder.model_container.model_datasources_dir + "/";

	    var __forms_path = api_path.join(__model_path, api.modelBuilder.model_container.model_forms_dir);
	    __forms_path = api_path.normalize(__forms_path);

	    var __forms_relative_path = "/" + api.modelBuilder.model_container.models_dir + "/" + __options.model.id + "/" +  api.modelBuilder.model_container.model_forms_dir + "/";

        console.log("__model_path               : " + __model_path);
        console.log("__datasources_path         : " + __datasources_path);
        console.log("__datasorces_relative_path : " + __datasorces_relative_path);


            var ___out = {
                model: null,
                ds: {
                    datasources: [],
	                forms: [],
	                applications: []
                }
            };
            try {
	            /**
	             * read model file
	             */
	            var __model_data = api_fs.readFileSync(__model_file);
	            __model_data = __model_data.toString();
	            ___out.model = api.toolsBuilder.JSON_parse(__model_data);

	            // console.log();
	            // console.log(___out.model);
	            // console.log();

	            /**
	             * read datasources files
	             */
	            api._.each(___out.model.datasources, function (__a_ds) {
		            var __datasources_file = __a_ds[2] + api.modelBuilder.model_container.ext;
		            var __dss_file = api_path.join(__datasources_path, __datasources_file);
		            __dss_file = api_path.normalize(__dss_file);
		            console.log("__dss_file = " + __dss_file);
		            var __dss_data = api_fs.readFileSync(__dss_file);
		            __dss_data = __dss_data.toString();
		            var __dss_obj = api.toolsBuilder.JSON_parse(__dss_data);
		            ___out.ds.datasources.push(__dss_obj);
	            });

	            /**
	             * read forms files
	             */
	            api._.each(___out.model.forms, function (__a_forms) {
		            var __form_file = __a_forms[2] + api.modelBuilder.model_container.ext;
		            __form_file = api_path.join(__forms_path, __form_file);
		            __form_file = api_path.normalize(__form_file);
		            console.log("form ___file = " + __form_file);
		            var __file_data = api_fs.readFileSync(__form_file);
		            __file_data = __file_data.toString();
		            var __file_obj = api.toolsBuilder.JSON_parse(__file_data);
		            ___out.ds.forms.push(__file_obj);
	            });

	            __client.context.data = {result: ___out, action: "loadModel", error: null};
	            __callback();
            }catch(e){
	            __client.context.data = {result: null, action: "loadModel", error: ["Model [" + __options.model.id + "] not exist!"]};
	            __callback();
            }
    } else {
        __client.context.data = {result: null, action: "loadModel", error: ["Not logged!"]};
        __callback();
    }
};

api.modelBuilder.deleteModel = function( __options, __client, __callback )
{
	var __app_dir = __client.application.dir;

	var api_fs = api.fs;
	var api_fs_extra = api["fs.extra"];
	var api_path = api.path;

	var __model_path = api_path.join(__app_dir, api.modelBuilder.model_container.static_dir, api.modelBuilder.model_container.models_dir, __options.model.id);
	__model_path = api_path.normalize(__model_path);

	console.log("__model_path              : " + __model_path);

	try{
		api_fs_extra.rmrfSync(__model_path);
		console.log("MODEL DELETED...");
	}catch(e){
		console.log(e);
	}
};

/**
 * load catalog of models
 * @param __options
 * @param __client
 * @param __callback
 */
api.modelBuilder.indexModel = function ( __options, __client, __callback )
{


    if (!api.modelBuilder.config.check_user_logged || __client.logged) {


        var __app_dir = __client.application.dir;

        var api_fs = api.fs;
        var api_fs_extra = api["fs.extra"];
        var api_path = api.path;


        var __model_path = api_path.join(__app_dir, api.modelBuilder.model_container.static_dir, api.modelBuilder.model_container.models_dir);
        __model_path = api_path.normalize(__model_path);

        var __model_dir_list = api_fs.readdirSync(__model_path);

        console.log(__model_dir_list);


        var __out = api._.map(__model_dir_list, function (__dm) {
            var __model_file = api_path.join(__model_path, __dm, api.modelBuilder.model_container.model_index_file);
            __model_file = api_path.normalize(__model_file);
            var __model_data = api_fs.readFileSync(__model_file);
	        __model_data = __model_data.toString();
            //__model_data = JSON.parse(__model_data);
	        __model_data = api.toolsBuilder.JSON_parse(__model_data);
            return {
                id: __model_data.id,
                description: __model_data.description,
	            type: "models"
            };
        });

        //__client.context.data = {result: __out, action: "indexModel",  error: null};
        __callback({result: __out, action: "indexModel",  error: null});
    } else {
        //__client.context.data = {result: null, action: "indexModel", error: ["Not logged!"]};
        __callback({result: null, action: "indexModel", error: ["Not logged!"]});
    }
};

/**
 * save DB model
 * @param __options
 * @param __client
 * @param __callback
 */

api.modelBuilder.saveModel = function ( __options, __client, __callback )
{

    if (!api.modelBuilder.config.check_user_logged || client.logged) {

        var __app_dir = __client.application.dir;

        var api_fs = api.fs;
        var api_fs_extra = api["fs.extra"];
        var api_path = api.path;

        var __model_path = api_path.join(__app_dir, api.modelBuilder.model_container.static_dir, api.modelBuilder.model_container.models_dir, __options.model.id);
        __model_path = api_path.normalize(__model_path);

        var __model_file = api_path.join(__model_path, api.modelBuilder.model_container.model_index_file);
        __model_file = api_path.normalize(__model_file);

        var __datasources_path = api_path.join(__model_path, api.modelBuilder.model_container.model_datasources_dir);
        __datasources_path = api_path.normalize(__datasources_path);

        var __datasorces_relative_path = "/" + api.modelBuilder.model_container.models_dir + "/" + __options.model.id + "/" +  api.modelBuilder.model_container.model_datasources_dir + "/";

        var __forms_path = api_path.join(__model_path, api.modelBuilder.model_container.model_forms_dir);
        __forms_path = api_path.normalize(__forms_path);

        var __forms_relative_path = "/" + api.modelBuilder.model_container.models_dir + "/" + __options.model.id + "/" +  api.modelBuilder.model_container.model_forms_dir + "/";

        console.log("__model_path              : " + __model_path);
        console.log("__datasorces_relative_path: " + __datasorces_relative_path);

        try{
	        api_fs_extra.rmrfSync(__model_path);
        }catch(e){
        	console.log(e);
        }

        /**
         * create model directory structure
         */
        api_fs.mkdirSync(__model_path);
        api_fs.mkdirSync(__datasources_path);
	    api_fs.mkdirSync(__forms_path);

        /**
         * prepare model file
         */
        api._.each(__options.model.datasources, function (__a) {
            // set relative path for datasources files
            __a[1] = __datasorces_relative_path + __a[2] + api.modelBuilder.model_container.ext;
        });

        /**
         * write model file
         */
        var __model_data = api.toolsBuilder.JSON_stringify(__options.model);
        api_fs.writeFileSync(__model_file, __model_data);

        /**
         * write datasources files
         */
        api._.each(__options.ds.datasources, function (__ds) {
            var __dss_file = __ds.id + api.modelBuilder.model_container.ext;
            __dss_file = api_path.join(__datasources_path, __dss_file);
            __dss_file = api_path.normalize(__dss_file);
            var __dss_data = api.toolsBuilder.JSON_stringify(__ds);
            api_fs.writeFileSync(__dss_file, __dss_data);
        });

	    /**
	     * write forms files
	     */
	    api._.each(__options.ds.forms, function (__form) {
		    var __dss_file = __form.id + api.modelBuilder.model_container.ext;
		    __dss_file = api_path.join(__forms_path, __dss_file);
		    __dss_file = api_path.normalize(__dss_file);
		    var __dss_data = api.toolsBuilder.JSON_stringify(__form);
		    api_fs.writeFileSync(__dss_file, __dss_data);
	    });

        __client.context.data = {result: "OK", action: "saveModel", error: null};
        __callback();
    } else {
        __client.context.data = {result: null, action: "saveModel", error: ["Not logged!"]};
        __callback();
    }
};