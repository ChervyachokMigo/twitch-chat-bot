
const log = require("../../tools/log.js");
const { twitchchat_disable } = require("../../DB.js");
const { ALL } = require("../constants/enumPermissions.js");

const { ModerationName } = require("../constants/general.js");

module.exports = {
    command_name: `disable`,
    command_description: ``,
    command_aliases: [`disable`, `отключить`],
    command_help: `disable`,
    command_permission: ALL,
    action: async ({channelname, tags, comargs})=>{
        var username = tags.username;
        if ( tags.username === ModerationName || tags.mod === true){
            username = channelname;
        }
        log( `[${channelname}] ${username} > disable bot functions`, `twitch chat`);
        await twitchchat_disable(username);
        return  {success: `для ${username} отключены функции бота`};
    }
}