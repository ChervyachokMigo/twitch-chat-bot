const { default: axios } = require("axios");
const log  = require("../../tools/log.js");
const dashboard = require('dashboard_framework')

const { ModerationName } = require("../constants/general");
const { addMessageAmount } = require("../tools/ChattersAmounts");
const { emit } = require("../tools/GuildEvents");
const { sendIfLongLength, saveMessageInBuffer } = require("../tools/MessageForwarder");

const manageMessage = require("../tools/manageMessage");
const { calc_message } = require("../../DB/stats.js");

require('colors');

const moduleName = 'Twitch Chat'

module.exports = async (twitchchat_client, channel, tags, message, self, TwitchChatIgnoreChannels) => {

    if(self) return;

    const escaped_message = message.trim();
    const channelname = channel.toString().replace(/#/g, "");
    const username = tags.username;
	const userid = tags['user-id'];
	const usercolor = tags.color;

	await calc_message(
		{ userid, username, usercolor }, 
		{ text: escaped_message });

    const messageFormatedText = `**${username}**: ${message}`;

    //await axios.post ('http://localhost:1111/add_message', {channelname, username, text: message});
    
	//console.log( {channelname, username, text: message} );
	console.log(`[${channelname}] ${tags.username} > ${message} `.green);

	await dashboard.emit_event({
        feedname: 'last_message',
        type: 'ticker',
        title: `<p style="display: inline; color: ${usercolor}">${username}</p>: ${message}`,
    });

    sendIfLongLength(messageFormatedText);

    saveMessageInBuffer(channelname, messageFormatedText);

    if (channelname === ModerationName){
        addMessageAmount(channelname, username);
    }

    if (escaped_message.indexOf(ModerationName) > -1) {
        emit('chatMention', {channelname, text: messageFormatedText});
    }

    const command_response = await manageMessage({ escaped_message, channelname, tags, TwitchChatIgnoreChannels });

    if ( command_response.success ){
        await twitchchat_client.say (channel, command_response.success );
        emit('runCommand', {channelname, text: messageFormatedText});
        log(`[${channelname}] ${tags.username} >  ${messageFormatedText} `, moduleName);
    } else if (command_response.error) {
        console.error('command_response.error', command_response.error);
    } else if (command_response.channelignore) {
        //console.log(`[ignoring] ${command_response.channelignore}`); //чатики
    } else if ( command_response.not_enabled) {
       // console.log(`[disabled] ${command_response.not_enabled}`) //чатики
    } else if ( command_response.disallowed_command){
        console.log(command_response.disallowed_command)
    } else if ( command_response.not_exists_command) {
        console.log(command_response.not_exists_command)
    } else if ( command_response.permission) {
        console.log(`[${channelname}] ${username} > ${command_response.permission}`)
    } else {
        //console.error('twitchchat: не существующая команда или не команда'); //чатик enabled
    }   

}