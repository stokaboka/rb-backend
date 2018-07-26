/**
 * Created by stokaboka on 22.03.2016.
 * igorhorev@gmail.com
 */

/**
 * need refactoring
 * @type {{}}
 */

api.queryBuilder = {};

api.queryBuilder.get_parse_limit = function(__limit){
    var __out = {
        start_row: 0,
        num_row: 0,
        min_row: 0,
        max_row: 0
    };

    if(__limit) {
        var __comma_pos = __limit.indexOf(",");
        var __start_row = __limit.substring(0, __comma_pos);
        var __num_row = __limit.substring(__comma_pos + 1);

        __out.start_row = parseInt(__start_row);
        __out.num_row = parseInt(__num_row);
        __out.min_row = parseInt(__start_row);
        __out.max_row =  parseInt(__start_row) + parseInt(__num_row);
    }

    return __out;
};

/**
 * Generate string - query part as fields list
 * @param __datarow
 * @returns {*|string}
 */
api.queryBuilder.get_fields_from_datarow = function ( __datarow ) {
    var ___out = api._.chain(__datarow)
        .map(function (___val, ___key) {return ___key;})
        .value()
        .join( ',');
    return ___out;
};

/**
 * Generate string - query part as binding variables list
 * @param __datarow
 * @param __replace_char
 * @returns {*|string}
 */
api.queryBuilder.get_binding_variables_from_datarow = function ( __datarow, __replace_char ) {
    var ___out = api._.chain(__datarow)
        .map(function (___val, ___key) {
            if( __replace_char ){
                return __replace_char;
            }else {
                return ':' + ___key;
            }
        })
        .value()
        .join( ',');
    return ___out;
};

/**
 * Generate string - query part as fields names and binding variables pairs list
 * @param __datarow
 * @param __glue
 * @param __replace_char
 * @returns {*|string}
 */
api.queryBuilder.get_fields_binding_variables_from_datarow = function (__datarow, __glue, __replace_char) {
    var ___out = api._.chain(__datarow)
        .map(function (___val, ___key) {
            if(typeof ___val == 'string' &&  ___val.charAt(0) === '(' && ___val.charAt(___val.length-1) === ')'){
                return ___key + ' IN ' + ___val;
            }else {
                if( __replace_char ){
                    return ___key + '=' + __replace_char;
                }else {
                    return ___key + '=:' + ___key;
                }
            }
        })
        .value()
        .join( __glue );
    return ___out;
};

/**
 * prepare query with LIMIT keyword for oracle SQL statement
 * @param __sql
 * @param __limit
 * @returns {*}
 */
api.queryBuilder.get_oracle_limit_sql = function(__sql, __limit){
    if(__limit) {
        var __limit_obj = api.queryBuilder.get_parse_limit(__limit);

        var __comma_pos = __limit.indexOf(",");
        var __start_row = __limit.substring(0, __comma_pos);
        var __num_row = __limit.substring(__comma_pos + 1);
        var __min_row = parseInt(__start_row);
        var __max_row = __min_row + parseInt(__num_row);

        return "select * from (select a.*, rownum rnum from (" + __sql + ") a where rownum <= " + __limit_obj.max_row + ") where rnum >= " + __limit_obj.min_row;
    }else{
        return __sql;
    }
};

/**
 * prepare binding variables for oracle select statement
 * @param __binding_variables
 * @returns {*}
 */
api.queryBuilder.get_oracle_binding_variables = function (__binding_variables) {
    if(__binding_variables) {
        var __bind_var_idx = -1;
        var __question_char_pos = __binding_variables.indexOf('?');
        while (__question_char_pos >= 0 && __bind_var_idx < 100) {
            __bind_var_idx++;
            var ___a = __binding_variables.substring(0, __question_char_pos);
            var ___b = __binding_variables.substr(__question_char_pos + 1);
            __binding_variables = ___a + String(':' + __bind_var_idx) + ___b;
            __question_char_pos = __binding_variables.indexOf('?');
        }
    }
    return  __binding_variables;
}

/**
 * close oracle connection
 * @param connection
 */
api.queryBuilder.release_oracle_connection = function (connection) {
    connection.release(
        function(err)
        {
            if (err) {
                application.log.error(err.message);
            }
        });
};

/**
 * close oraacle result set and connection
 * @param connection
 * @param resultSet
 */
api.queryBuilder.close_oracle_result_set = function (connection, resultSet){
    resultSet.close(
        function(err)
        {
            if (err) {
                application.log.error(err.message);
            }
            api.queryBuilder.release_oracle_connection(connection);
        });
};

/**
 * pasre, check and prepare sql select statement before execute query
 * @param __schema
 * @param __data
 * @returns {{table: *, fields: string, where: string, where_values: Array, limit: string, group_by: string, order_by: string, result: boolean, select: string, count: string, resultSet: boolean, maxRows: number}}
 */
api.queryBuilder.prepare_select_statement = function ( __schema, __data )
{

    var __out = {
        table: __data.table,
        fields: '*',
        where: '',
        where_values: [],
        limit: '',
        group_by: '',
        order_by: '',
        result: false,
        select: '',
        count: '',
        resultSet: false,
        maxRows: 100,
        err: null
    }


    if(__data.table){
        __out.result = true;
    }

    if (__data.columns){
        __out.fields = __data.columns;
    }


    if (__data.filter) {
        __out.where = __data.filter.expression;
        if(__data.filter.values == null || typeof __data.filter.values == "undefined"){
            __out.where_values = [];
        }else{
            __out.where_values = __data.filter.values;
        }

        if (__out.where) {
            __out.where = ' WHERE ' + __out.where;
        } else {
            __out.where = '';
        }
    }

    if (__data.groupby) {
        __out._group_by = ' GROUP BY ' + __data.groupby;
        if (__data.having) {
            __out.group_by = ' HAVING ' + __data.having;
        }
    }

    if (__data.orderby) {
        __out.order_by = ' ORDER BY ' + __data.orderby;
    }


    switch (__schema){
	    case 'pgsql':
        case 'mysql':
            if (__data.limit) {
                __out.limit = ' LIMIT ' + __data.limit;
            }
            __out.select = 'SELECT ' + __out.fields + ' FROM ' + __out.table + __out.where + __out.group_by + __out.order_by + __out.limit;
            break;
        case 'oracle':
            if (__data.limit) {
                __out.limit = __data.limit;
                __out.resultSet = false;
                var ___lo = api.queryBuilder.get_parse_limit(__out.limit);
                __out.maxRows = ___lo.num_row;
            }else{
                __out.resultSet = true;
            }
            __out.where = api.queryBuilder.get_oracle_binding_variables(__out.where);
            __out.select = 'SELECT ' + __out.fields + ' FROM ' + __out.table + __out.where + __out.group_by + __out.order_by;
            __out.select = api.queryBuilder.get_oracle_limit_sql(__out.select, __out.limit);
            break;
        default:
            __out.result = false;
            __out.err = 'Scheme ['+__schema+'] not supported.';
    }

    __out.count = 'SELECT COUNT(*) AS cnt ' + ' FROM ' + __out.table + __out.where;

    return __out;
};

/**
 * convertr Data Rows Array to data rows string
 * @param __datarows
 * @returns {*|string}
 */
api.queryBuilder.prepare_datarows = function ( __datarows ){
    var __out = api._.map( __datarows, function ( ___val ) {
            var ____out = api._.map( ___val, function ( ____val ) {
                return  "'"+____val+"'";
            }).join(',');
            return "(" + ____out + ")";
        }).join(',');
	return __out;
};

/**
 * concatenate row objects to binding variables array
 * @returns {Array}
 */
api.queryBuilder.prepare_datarow_array = function ( ){
    
    var __out = [];
    
    for (var i = 0; i < arguments.length; i++) {
        __out = __out.concat( api._.values(arguments[ i ]) );
    }
    
    return __out;
};

/**
 * Prepare statement (insert, update, delete) based on input data
 * @param __schema
 * @param __data
 * @returns {{table: string, action: string, insert_stmt: string, update_stmt: string, delete_stmt: string, query_stmt: string, where: null, datarow: {}, datarows: null, fields: null, result: boolean, err: null}}
 */
api.queryBuilder.prepare_save_statement = function (__schema, __data)
{
//    if (__client_data.table && __client_data.action && __client_data.datarow) {
    var __out = {
        table: '',
        action: '',
        insert_stmt: '',
        update_stmt: '',
        delete_stmt: '',
	    query_stmt: '',
        where: null,
        datarow: {},
	    datarows: null,
	    fields: null,
        result: false,
        err: null
    };

    if(__data.table && __data.action && (__data.datarow || (__data.datarows && __data.fields)  )) {

        __out.datarow = __data.datarow;
        __out.table = __data.table;
        __out.action = __data.action;

        if(__data.datarows){
	        __out.datarows = __data.datarows;
	        __out.fields = __data.fields;
        }
        
        var ___fields;
        var ___bind_variables;
        var ___fields_bind_variables;
        var ___replace_char;
        
        switch (__schema){
            case 'mysql':
                ___replace_char = '?';
                break;
            case 'pgsql':
            case 'oracle':
                ___replace_char = '';
            default:
                __out.err = 'Scheme ['+__schema+'] not supported.';
        }
        
        if( __out.err ) {
            __out.result = false;
        }else{
            switch (__out.action){
                case "I" :
                    ___fields = api.queryBuilder.get_fields_from_datarow( __data.datarow );
                    ___bind_variables = api.queryBuilder.get_binding_variables_from_datarow( __data.datarow, ___replace_char );
                    __out.insert_stmt = 'INSERT INTO ' + __out.table + ' (' + ___fields + ') VALUES (' +___bind_variables + ')';
                    __out.datarow = api.queryBuilder.prepare_datarow_array( __data.datarow );
                    __out.result = true;
                    break;
                case 'U' :
                    ___fields_bind_variables = api.queryBuilder.get_fields_binding_variables_from_datarow( __data.datarow, ',', ___replace_char );
                    __out.update_stmt = 'UPDATE ' + __out.table + ' SET ' + ___fields_bind_variables;
                    if (__data.where) {
                        __out.where = api.queryBuilder.get_fields_binding_variables_from_datarow(__data.where, ' AND ', ___replace_char);
                        __out.update_stmt = __out.update_stmt + ' WHERE ' + __out.where;
                        __out.datarow = api.queryBuilder.prepare_datarow_array( __data.datarow, __data.where );
                        __out.result = true;
                    }else{
                        __out.result = false;
                        __out.err = '[MySQL] Update without where';
                    }
                    break;
                case 'D' :
                    if( __data.where ) {
                        __out.datarow = __data.where;
                    }
                    __out.where = api.queryBuilder.get_fields_binding_variables_from_datarow(__out.datarow, ' AND ', ___replace_char);
                    __out.delete_stmt = 'DELETE FROM ' + __out.table + ' WHERE ' +  __out.where;
                    __out.datarow = api.queryBuilder.prepare_datarow_array( __out.datarow );
                    __out.result = true;
                    break;
        
                case "Q" :
                    __out.datarows = api.queryBuilder.prepare_datarows(__out.datarows);
                    __out.query_stmt = 'INSERT INTO ' + __data.query + ' (' + ___fields + ') VALUES '+__out.datarows;
                    __out.datarows = null;
                    break;
                case "IB" :
                    if(typeof __out.fields != 'undefined'){
                        ___fields = __out.fields.join( ',');
                    }else if(typeof __out.datarow != 'undefined'){
                        ___fields = api.queryBuilder.get_fields_from_datarow(__data.datarow);
                    }
                    __out.datarows = api.queryBuilder.prepare_datarows(__out.datarows);
                    __out.insert_stmt = 'INSERT INTO ' + __out.table + ' (' + ___fields + ') VALUES '+__out.datarows;
                    if(typeof __data.upsert !== 'undefined'){
                        __out.insert_stmt = __out.insert_stmt  + ' ' + __data.upsert;
                    }
                    __out.datarows = null;
                    break;
                default :
            }
        }
        
    }else{
        __out.err = 'Incorrect statement';
    }

    return __out;
};

/**
 * prepare and execute query to database
 * @param __client
 * @param __callback
 */
api.queryBuilder.select = function (__client, __callback, __options) {

    if(typeof __options == 'undefined'){
        __options = {};
    }

    var ___include_statement = __options.hasOwnProperty('include_statement') ? __options.include_statement : false;

    var __client_data = {};
    if(typeof __client.data == 'string') {
        __client_data = JSON.parse(__client.data);
    }else{
        __client_data = __client.data;
    }

    if(__client_data.database) {


        var __database = application.databases[__client_data.database];



        var __select_statement = {result: false};

        if(__options.hasOwnProperty('select')){
            __select_statement = __options;
        }else {
            try {
                //__callback( { info: 'select 7', db: __database} ); return;
                __select_statement = api.queryBuilder.prepare_select_statement(__database.schema, __client_data);
            }catch( e ){
                //__callback( { info: 'select 8' } ); return;
            }
        }


        if (__select_statement.result) {

            try {

                switch (__database.schema){
	                case 'pgsql':
		                var query = __database.connection.query(__select_statement.select, __select_statement.where_values,  function (err, result) {

			                if(err){
				                application.log.error(err.message);
				                __client.context.data = {result: [], error: err.message, statement: null};
				                if(__callback)__callback(); else return;
			                }else{
				                __client.context.data =
					                {
						                result: result.rows,
						                statement: null,
						                error: null,
						                total_rows: result.rowCount,
						                fields: result.fields,
						                statement: ___include_statement ? __select_statement : null
					                };
				                // if(___include_statement){
					             //    __client.context.data["statement"] = __select_statement;
				                // }

				                __select_statement.count = null;

				                if (__callback)__callback(); else return;

				                // if(__select_statement.count) {
					             //    var counter = __database.connection.query(__select_statement.count, __select_statement.where_values, function (err, result) {
						         //        if (err) {
							     //            application.log.error(err.message);
							     //            __client.context.data["error"] = err.message;
						         //        } else {
							     //            __client.context.data["total_rows"] = result[0]["cnt"];
						         //        }
						         //        if (__callback)__callback(); else return;
					             //    });
				                // }else{
					             //    if (__callback)__callback(); else return;
				                // }
			                }

		                });
		                break;
                    case "mysql":
                        var query = __database.connection.query(__select_statement.select, __select_statement.where_values,  function (err, result) {

                            if(err){
                                application.log.error(err.message);
                                __client.context.data = {result: [], error: err.message, statement: null};
                                if(__callback)__callback(); else return;
                            }else{
                                __client.context.data = {result: result, statement: null, error: null, total_rows: 100};
                                if(___include_statement){
                                    __client.context.data["statement"] = __select_statement;
                                }
                                if (result && result.length) {
                                    __client.context.data["total_rows"] = result.length;
                                }

                                if(__select_statement.count) {
                                    var counter = __database.connection.query(__select_statement.count, __select_statement.where_values, function (err, result) {
                                        if (err) {
                                            application.log.error(err.message);
                                            __client.context.data["error"] = err.message;
                                        } else {
                                            __client.context.data["total_rows"] = result[0]["cnt"];
                                        }
                                        if (__callback)__callback(); else return;
                                    });
                                }else{
                                    if (__callback)__callback(); else return;
                                }
                            }
                        });
                        break;
                    case "oracle":
                        __database.pool.getConnection(function onConnection(poolError, connection) {
                            if(poolError){
                                application.log.error(poolError.message);
                                application.log.debug(__select_statement.select + '   DATA:' + JSON.stringify(__select_statement.where_values));
                            }else {
                                connection.query(__select_statement.select, __select_statement.where_values, function onResults(error, results) {
                                    if (error) {
                                        __client.context.data = {result: [], error: error.message, statement: null};
                                        application.log.error(error.message);
                                        application.log.debug(__select_statement.select + '   DATA:' + JSON.stringify(__select_statement.where_values));
                                    } else {
                                        __client.context.data = {result: results, error: null, statement: null};
                                        if(___include_statement){
                                            __client.context.data["statement"] = __select_statement;
                                        }
                                        application.log.debug('*** '+__select_statement.select + '   DATA:' + JSON.stringify(__select_statement.where_values));
                                    }
                                    connection.close();
                                    if(__callback)__callback(); else return;
                                });
                            }
                        });
                        break;
                    default:
                        application.log.error("Scheme ["+__database.schema+"] not supported");
                        __client.context.data = {result: [], error: "Scheme ["+__database.schema+"] not supported"};
                        if(__callback)__callback(); else return;
                }

            } catch (err) {
                application.log.error(err);
                __client.context.data = {result: [], error: err};
                if(__callback)__callback(); else return;
            }

        } else {
            application.log.error('Prepare select statement: ' + __select_statement.err);
            __client.context.data = {result: [], error: 'Prepare select statement: ' + __select_statement.err, total_rows: 0};
            if(__callback)__callback(); else return;
        }
    }else{
        application.log.error("Database not specified.");
        __client.context.data = {result: [], error: "Database not specified."};
        if(__callback)__callback(); else return;
    }
};


/**
 * prepare and save data into table
 * @param __client
 * @param __callback
 */

api.queryBuilder.save = function (__client, __callback) {
    try {
        var __client_data = api.toolsBuilder.JSON_parse(__client.data);
        if(__client_data.database) {
            var __database = application.databases[__client_data.database];

            var __save_statement = api.queryBuilder.prepare_save_statement(__database.schema, __client_data);

            if(__save_statement.result) {
                try{
                    switch (__database.schema) {
	                    case 'pgsql':
                        case "mysql":
	                        
                            var ___mysql_query_callback = function (err, result) {
		                        if(err){
			                        application.log.error("ERROR: schema="+__database.schema + " action=" + __save_statement.action + " error="  + err);
		                        }
		                        __client.context.data = {result: result, error: err};
		                        if(__callback){
		                            __callback();
                                } else {
		                            return;
                                }
	                        };

                            switch (__save_statement.action) {
                                // call stored procedure
                                case "P" :
	                                var _insert = __database.connection.query(__save_statement.insert_stmt, __save_statement.datarows, ___mysql_query_callback);
                                    break;

	                            /**
	                             *  custom query
	                             *  __save_statement.datarows - array of arrays contents rows of data
	                             */
	                            case "Q" :
		                            var _insert = __database.connection.query(__save_statement.query_stmt, __save_statement.datarows, ___mysql_query_callback);
		                            break;
	                            /**
                                 *  Bulk insert
                                 *  __save_statement.datarows - array of arrays contents rows of data
	                             */
	                            case "IB" :
		                            var _insert = __database.connection.query(__save_statement.insert_stmt, __save_statement.datarows, ___mysql_query_callback);
		                            break;
		                            
                                case "I" :
                                    //var _insert = __database.connection.insert(__save_statement.table, __save_statement.datarow, ___mysql_query_callback);
                                    var _insert = __database.connection.query(__save_statement.insert_stmt, __save_statement.datarow, ___mysql_query_callback);
                                    break;
                                case "U" :
                                    //var _update = __database.connection.update(__save_statement.table, __save_statement.datarow, ___mysql_query_callback);
                                    var _update = __database.connection.query(__save_statement.update_stmt, __save_statement.datarow, ___mysql_query_callback);
                                    break;

                                case "D" :
                                    //var _delete = __database.connection.delete(__save_statement.table, __save_statement.datarow, ___mysql_query_callback);
                                    var _delete = __database.connection.query(__save_statement.delete_stmt, __save_statement.datarow, ___mysql_query_callback);
                                    break;

                                default :
                                    __client.context.data = {result: {}, error: "incorrect save action"};
                                    if(__callback)__callback(); else return;
                            }
                            break;

                        case "oracle":

                            __database.pool.getConnection(function onConnection(poolError, connection) {
                                if(poolError){
                                    application.log.error(poolError.message);
                                }else {
                                    switch (__save_statement.action) {
                                        case "I" :
                                            connection.insert(__save_statement.insert_stmt, __save_statement.datarow, {autoCommit: true}, function onResults(error, output) {
                                                if(error){
                                                    __client.context.data = {result: 0, error: error.message};
                                                    application.log.error(error.message);
                                                    application.log.debug('INSERT FAIL: '+__save_statement.insert_stmt + ' DATA:' + JSON.stringify(__save_statement.datarow));
                                                }else {
                                                    __client.context.data = {result: output, error: null};
                                                    application.log.debug(__save_statement.insert_stmt + ' DATA:' + JSON.stringify(__save_statement.datarow));
                                                }
                                                connection.close();
                                                if(__callback)__callback(); else return;
                                            });

                                            break;

                                        case "U" :
                                            connection.update(__save_statement.update_stmt, __save_statement.datarow, {autoCommit: true}, function onResults(error, output) {
                                                if(error){
                                                    __client.context.data = {result: 0, error: error.message};
                                                    application.log.error(error.message);
                                                    application.log.debug('UPDATE FAIL: '+__save_statement.update_stmt + ' DATA:' + JSON.stringify(__save_statement.datarow));
                                                }else {
                                                    __client.context.data = {result: output.rowsAffected, error: null};
                                                    application.log.debug(__save_statement.update_stmt + ' DATA:' + JSON.stringify(__save_statement.datarow));
                                                }
                                                connection.close();
                                                if(__callback)__callback(); else return;
                                            });
                                            break;

                                        case "D" :
                                            connection.execute(__save_statement.delete_stmt,  function onResults(error, output) {
                                                if(error){
                                                    __client.context.data = {result: 0, error: error.message};
                                                    application.log.debug('DELETE FAIL: '+__save_statement.delete_stmt + ' DATA:' + JSON.stringify(__save_statement.datarow));
                                                    application.log.error(error.message);
                                                    connection.close();
                                                    if(__callback)__callback(); else return;
                                                }else {
                                                    connection.commit(function (commit_error) {
                                                        if(commit_error){
                                                            __client.context.data = {result: 0, error: commit_error.message};
                                                            application.log.error(commit_error.message);
                                                            application.log.debug('COMMIT FAIL: '+__save_statement.delete_stmt + ' DATA:' + JSON.stringify(__save_statement.datarow));
                                                        }else{
                                                            __client.context.data = {result: output.rowsAffected, error: null};
                                                            application.log.debug(__save_statement.delete_stmt + ' DATA:' + JSON.stringify(__save_statement.datarow));
                                                        }
                                                        connection.close();
                                                        if(__callback)__callback(); else return;
                                                    });
                                                }
                                            });
                                            break;

                                        default :
                                            __client.context.data = {result: {}, error: "incorrect save action"};
                                            if(__callback)__callback(); else return;
                                    }
                                }
                            });

                            break;
                        default:
                            application.log.error("Scheme [" + __database.schema + "] not supported");
                            __client.context.data = {result: [], error: "Scheme [" + __database.schema + "] not supported"};
                            if(__callback)__callback(); else return;
                    }
                }catch(ex){
                    __client.context.data = {result: {}, error: ex};
                    if(__callback)__callback(); else return;
                }
            }else{
                __client.context.data = {result: {}, error: __save_statement.err ? __save_statement : "incorrect paramenters"};
                if(__callback)__callback(); else return;
            }

        }else{
            __client.context.data = {result: [], error: "Database not specified."};
            if(__callback)__callback(); else return;
        }
    } catch (err) {
        __client.context.data = {result: [], error: err.message};
        if(__callback)__callback(); else return;
    }
};

