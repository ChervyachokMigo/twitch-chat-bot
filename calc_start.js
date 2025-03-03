const { writeFileSync, appendFileSync } = require('fs');

const { prepareDB } = require('./DB/defines.js');

const beatmaps_db = require("./beatmaps_db.js")

const { loadTwitchChatCommands, viewCommands } = require("./twitchchat/tools/AvailableCommands.js")
const { init_osu_irc } = require("./twitchchat/tools/ircManager.js");

const oauth = require('./twitchchat/tools/oauth_token.js');

const main = async () => {
    process.title = 'calculation_pp';
    
	await prepareDB();
	
	await beatmaps_db.init();

	console.log('finished');
		
	// } catch (e) {
	// 	console.error(__dirname, e);
	// 	const str_error = [
	// 		new Date().toISOString().slice(0, 19).replace('T',' '),
	// 		e.name,
	// 		e.message,
	// 		e.stack,
	// 		e.toString()
	// 	].join(' ');
	// 	appendFileSync('errors.log', str_error + '\n');
	// 	throw new Error(e)
	// }
}

main();
