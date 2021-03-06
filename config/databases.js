{
  // Databases including persistent session storage and application specific

	impress: {
		//url: "mongodb://192.168.10.30:27017/impress", // MongoDB connection string
		//url: "mongodb://192.168.0.11:27017/impress", // MongoDB connection string
		url: "mongodb://127.0.0.1:27017/impress", // MongoDB connection string
		slowTime: "2s",                           // time to log query as slow
		collections: ["sessions", "users", "groups"],  // Collection name for store sessions (to be removed and use introspection)
		//security: true                            // this database will be used for security subsystem storage (sessions, users, groups)
	},

	system: {
	 	//url: "mysql://root:123456789@192.168.0.11/agat?timezone=-0300", // MySQL connection example
		url: "mysql://root:123456789@localhost/agat?timezone=-0300", // MySQL connection example
		//url: "mysql://impress:123456789@192.168.2.2/agat?timezone=-0300", // MySQL connection example
	 	slowTime: 1000                                // time to log query as slow
	 },

	employees: {
		url: "mysql://root:123456789@localhost/employees?timezone=-0300", // MySQL connection example
	 	slowTime: 1000                                // time to log query as slow
	 },

	// sakila: {
	// 	url: "mysql://root:123456789@localhost/sakila?timezone=-0300", // MySQL connection example
	//  	slowTime: 1000                                // time to log query as slow
	//  },
	 
  // MySQL example database configuration
  //
  //  mysqlConnection: {
  //    // Connection string (required)
  //    url: 'mysql://impress:password@127.0.0.1/impress',
  //    // Time to log query as slow
  //    // (optional, default: '2s', in milliseconds or string like '5s')
  //    slowTime: 1000
  //  },

  // PgSQL example database configuration
  //
  //  pgsqlConnection: {
  //    // Connection string (required)
  //    url: 'postgres://impress:password@127.0.0.1/test',
  //    // Time to log query as slow
  //    // (optional, default: '2s', in milliseconds or string like '5s')
  //    slowTime: 1000
  //  },

  // MongoDB example database configuration
  //
  //  mongoConnection: {
  //    // Connection string (required)
  //    url: 'mongodb://127.0.0.1:27017/dbname',
  //    // Collection to be created automatically if not exists
  //    collections: ['collname1', 'collname2'],
  //    // Time to log query as slow
  //    // (optional, default: '2s', in milliseconds or string like '5s')
  //    slowTime: '2s'
  //  }

}
