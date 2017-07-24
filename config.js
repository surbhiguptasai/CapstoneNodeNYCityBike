exports.DATABASE_URL = process.env.DATABASE_URL ||
                       global.DATABASE_URL ||
                      'mongodb://localhost/capstone-nycbike-app';
exports.TEST_DATABASE_URL = (
                          	process.env.TEST_DATABASE_URL ||
	                   'mongodb://localhost/test-capstone-nycbike-app');
exports.PORT = process.env.PORT || 8080;