const { writeFileSync, appendFileSync } = require('fs');

const { prepareDB } = require('./DB/defines.js');

const beatmaps_db = require("./beatmaps_db.js")

const { loadTwitchChatCommands, viewCommands } = require("./twitchchat/tools/AvailableCommands.js")
const { init_osu_irc } = require("./twitchchat/tools/ircManager.js");

const { twitchchat_init, twitchchat_refresh_category } = require(`./twitchchat/twitchchat.js`);
const { twitchchat_load_events } = require("./twitchchat/tools/GuildEvents.js");
const { setInfinityTimerLoop } = require("./tools/tools.js");
const log = require("./tools/log.js");
const { init_user_stats } = require('./DB/stats.js');
const oauth = require('./twitchchat/tools/oauth_token.js');
const get_channel_info = require('./requests/get_channel_info.js');
const bot_key_events = require('./twitchchat/tools/bot_key_events.js');

const main = async () => {
    process.title = 'twitch_chat_bot';
    try {

		await prepareDB();
		await init_user_stats();
		
		console.log('twitchchat response', await twitchchat_init());
		
		init_osu_irc();
		
		loadTwitchChatCommands();
		//setInfinityTimerLoop(twitchchat_refresh_category, 300);
		
		twitchchat_load_events();
		
		//await beatmaps_db.init();

		await oauth.init();
		
		console.log('bot started');

		const channel_info = await get_channel_info('478880338');

		console.log(`[${channel_info.broadcaster_name} > ${channel_info.game_name} > ${channel_info.title}]`);
	
		bot_key_events.init();

	} catch (e) {
		console.error(__dirname, e);
		const str_error = [
			new Date().toISOString().slice(0, 19).replace('T',' '),
			e.name,
			e.message,
			e.stack,
			e.toString()
		].join(' ');
		appendFileSync('errors.log', str_error + '\n');
		throw new Error(e)
	}
}

main();
