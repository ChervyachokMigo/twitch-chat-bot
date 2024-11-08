
const { Client } = require('tmi.js');

const log = require("../tools/log.js");

const { get_twitch_channels_names } = require("../DB.js");

//const { getTwitchOauthToken } = require('./requests.js');
const { twitch_chat_token } = require('../config.js');

const { ModerationName } = require('./constants/general.js');

const { initMessageForwarderTimer } = require('./tools/MessageForwarder.js');
const { initCommandsForwarderTimer, } = require('./tools/CommandForwarder.js');

const BannedChannels = require('./tools/BannedChannels.js');

const onMessage = require('./events/onMessage.js');
const display_init = require('./display/init.js');
const { inc_joins } = require('../DB/stats.js');
const change_title = require('../requests/change_title.js');
const get_user_id = require('../requests/get_user_id.js');

const moduleName = `Twitch Chat`;

this.twitchchat_client = null;

const twitchchat_refresh_category = async () =>{

    const { TwitchChatNames } = await get_twitch_channels_names();
    const old_channels = [...this.twitchchat_client.getChannels().map( val => val.replace('#', '') )];

    const channels_to_join = TwitchChatNames.filter( val => old_channels.indexOf(val) === -1 );
    if (channels_to_join.length > 0){
        log(`joined to `+channels_to_join.join(', '), moduleName);
        for (let channelname of channels_to_join) {
            await this.twitchchat_client.join(channelname);
        }
    }

    const channels_to_part = old_channels.filter( val => TwitchChatNames.indexOf(val) === -1 );
    if (channels_to_part.length > 0){
        log(`leave from `+channels_to_part.join(', '), moduleName);
        for (let channelname of channels_to_part) {
            await this.twitchchat_client.part(channelname);
        }
    }
}

const twitchchat_init = async() => {    
    log('Загрузка твич чатов', moduleName);

    /*const {TwitchChatNames, TwitchChatIgnoreChannels} = await get_twitch_channels_names();

    if (TwitchChatNames.length === 0){
        log('no selected channels', moduleName)
        return;
    }*/

    //initMessageForwarderTimer();
    //initCommandsForwarderTimer();   

	await display_init ();

    this.twitchchat_client = new Client({
        options: { debug: false },
        identity: {
            username: 'sad_god_',
            password: `oauth:${twitch_chat_token}`
        },
		//channels: TwitchChatNames
        channels: ['sad_god_']
    });

    this.twitchchat_client.on('join', async (channelname, username) => {
        const new_channelname = channelname.replace('#', '');
        if (new_channelname === ModerationName){
            log(`[${new_channelname}] ${username} > подключен к чату`, moduleName);
			await inc_joins( username );
            if (username !== ModerationName){
                //await this.twitchchat_client.say(new_channelname, `@${username}, привет` );
            } else {
               //await this.twitchchat_client.say(new_channelname, `@${username}, привет единственный зритель` );
            }
        }
    });

	this.twitchchat_client.on('part', async (channelname, username) => {
        const new_channelname = channelname.replace('#', '');
        if (new_channelname === ModerationName){
            log(`[${new_channelname}] ${username} > отключен от чата`, moduleName);
        }
    });

    this.twitchchat_client.on('notice', async (channelname, msgid, message) => {
        log(`[notice] ${channelname} > ${msgid} > ${message}`, moduleName);
        if (msgid === 'msg_banned'){
            await BannedChannels.add(channelname);
            await this.twitchchat_client.ban('#'+ModerationName, channelname, 'beacon');
        }
    });

    this.twitchchat_client.on('message', async (channel, tags, message, self) => {
        //await onMessage(this.twitchchat_client, channel, tags, message, self, TwitchChatIgnoreChannels)
		await onMessage(this.twitchchat_client, channel, tags, message, self, [])
    });

    return await this.twitchchat_client.connect();
}

module.exports = {
    twitchchat_init,
    twitchchat_refresh_category,
}