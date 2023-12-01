const BannedChannels = require("./twitchchat/tools/BannedChannels.js");

const { GET_VALUES_FROM_OBJECT_BY_KEY, onlyUnique } = require("./tools/tools.js");
const { MYSQL_GET_ALL, MYSQL_DELETE, MYSQL_SAVE, MYSQL_GET_ONE } = require("./DB/base.js");

const { game_category } = require("./twitchchat/constants/general.js");

async function MYSQL_GET_TRACKING_DATA_BY_ACTION( action, custom_query_params = {} ){
    var query_params = {};
    var query_action = action;

    switch (action){
        case 'twitchchat':
            query_params = {tracking: true};
            break;
        default:
            throw new Error('undefined action');
    }
    return await MYSQL_GET_ALL(query_action, query_params);
}

const MYSQL_GET_TRACKING_TWITCH_CHATS = async () => {
    const mysql_data = await MYSQL_GET_TRACKING_DATA_BY_ACTION('twitchchat', {tracking: true});
    let usernames = [];
    if (mysql_data.length > 0){
        usernames = GET_VALUES_FROM_OBJECT_BY_KEY(mysql_data, 'username');
    }
    return usernames;
}

const MYSQL_GET_IGNORE_TWITCH_CHATS = async () => {
    const mysql_data = await MYSQL_GET_ALL('twitchchat_ignores');
    let usernames = [];
    if (mysql_data.length > 0){
        usernames = GET_VALUES_FROM_OBJECT_BY_KEY(mysql_data, 'channelname');
    }
    return usernames;
}

const MYSQL_GET_BANNED_TWITCH_CHATS = async () => {
    const mysql_data = await MYSQL_GET_ALL('twitch_banned');
    let usernames = [];
    if (mysql_data.length > 0){
        usernames = GET_VALUES_FROM_OBJECT_BY_KEY(mysql_data, 'channelname');
    }
    return usernames;
}

module.exports = {
    twitchchat_disable: async function  (channelname) {
        //await MYSQL_SAVE( 'twitchchat_ignores' , {channelname}, {channelname});
        await MYSQL_DELETE( 'twitchchat_enabled' , {channelname});
    },

    twitchchat_enable: async function  (channelname) {
        await MYSQL_DELETE( 'twitchchat_ignores' , {channelname});
        await MYSQL_SAVE( 'twitchchat_enabled' , {channelname}, {channelname});
    },

    get_twitch_channels_names: async() => {
        const TwitchChatTrackingNames = await MYSQL_GET_TRACKING_TWITCH_CHATS();
        /*const TwitchChatLiveNames = await getTwitchSteamsByCategory({
            game_id: game_category.osu,
            language: 'ru'
        });*/
        const TwitchChatLiveNames = ['sed_god']

        const TwitchBanned = await MYSQL_GET_BANNED_TWITCH_CHATS();
        const TwitchChatIgnoreChannels = await MYSQL_GET_IGNORE_TWITCH_CHATS();
        const TwitchChatNames = onlyUnique([...TwitchChatTrackingNames, ...TwitchChatLiveNames])
            .filter( chan => BannedChannels.isNotExists(chan) ).filter( x => TwitchBanned.indexOf(x) === -1)
            .sort();

        return { TwitchChatNames, TwitchChatIgnoreChannels };
    },

    GET_TWITCH_OSU_BIND: async (twitch_id) => {
        const mysql_result = await MYSQL_GET_ONE('twitch_osu_binds', { twitch_id } );
        if (mysql_result === null){
            return null;
        }
        return mysql_result;

    },

    MYSQL_ADD_TWITCH_OSU_BIND: async ({twitch, osu}) => {
        await MYSQL_SAVE('twitch_osu_binds', {twitch_id: twitch.id}, {
            twitch_name: twitch.name,
            osu_id: osu.id,
            osu_name: osu.name
        });
    },

    MYSQL_GET_IGNORE_TWITCH_CHATS,

    MYSQL_GET_ENABLED_TWITCH_CHATS : async () => {
        const mysql_data = await MYSQL_GET_ALL('twitchchat_enabled');
        let usernames = [];
        if (mysql_data.length > 0){
            usernames = GET_VALUES_FROM_OBJECT_BY_KEY(mysql_data, 'channelname');
        }
        return usernames;
    },

    MYSQL_GET_TRACKING_TWITCH_CHATS,
}