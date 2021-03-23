exports.DATABASE_URL = process.env.DATABASE_URL ||
                       global.DATABASE_URL ||
                      'mongodb+srv://surbhi:surbhi@cluster0.p9ab3.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
exports.TEST_DATABASE_URL = (
                          	process.env.TEST_DATABASE_URL ||
	                   'mongodb+srv://surbhi:surbhi@cluster0.p9ab3.mongodb.net/myFirstDatabase?retryWrites=true&w=majority');
exports.PORT = process.env.PORT || 8080;