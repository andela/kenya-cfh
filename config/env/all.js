import path from 'path'; 
 
const rootPath = path.normalize(__dirname + '/../..'); 

const testDb = process.env.MONGOHQ_TEST; 
const prodDB = process.env.MONGOHQ_URL; 
 
const database = (process.env.NODE_ENV === 'test') ? testDb : prodDB; 

module.exports = { 
	root: rootPath, 
	port: process.env.PORT || 3000, 
	db: database, 
	secret: process.env.SECRET 
};
