const { prepareDB } = require('./DB/defines.js');

const beatmaps_db = require("./beatmaps_db.js")

const { loadTwitchChatCommands, viewCommands } = require("./twitchchat/tools/AvailableCommands.js")
const { init_osu_irc } = require("./twitchchat/tools/ircManager.js");

const { twitchchat_init, twitchchat_refresh_category } = require(`./twitchchat/twitchchat.js`);
const { twitchchat_load_events } = require("./twitchchat/tools/GuildEvents.js");
const { setInfinityTimerLoop } = require("./tools/tools.js");
const log = require("./tools/log.js");

const main = async () => {

    await prepareDB();
    await twitchchat_init();
    
    init_osu_irc();
    
    loadTwitchChatCommands();
    setInfinityTimerLoop(twitchchat_refresh_category, 300);

    log('запуск событий чата', 'initialisation');
    twitchchat_load_events();
    
    await beatmaps_db.init();
}

main();