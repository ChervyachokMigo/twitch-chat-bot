const { prepareDB } = require('./DB/defines.js');
const beatmaps_db = require("./beatmaps_db.js")

const main = async () => {
    process.title = 'calculation_pp';
    
	await prepareDB();
	await beatmaps_db.init(false, true);

	console.log('finished');
}

main();
