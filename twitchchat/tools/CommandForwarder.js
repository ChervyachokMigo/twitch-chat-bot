const { ChatRefreshRate } = require("../../settings");
const { setInfinityTimerLoop } = require("../../tools/tools.js");

const { emit } = require("./GuildEvents");
const { formatCommandText } = require("./general");

this.timer = null;

this.commands = [];

const sendLastCommands = async () => {
    if (this.commands.length > 0){
        const text = this.commands.map( val => formatCommandText(val)).join(`\n`);
        emit('lastCommands', {text, channelname: 'last commands'});
        this.commands = [];
    }
}

module.exports = {
    initCommandsForwarderTimer: () => {
        clearInterval(this.timer);
        this.timer = setInfinityTimerLoop(sendLastCommands, ChatRefreshRate);
    },

    sendLastCommands,

    saveLastCommand: ({command, channelname, username}) => {
        this.commands.push({command, channelname, username});
    }
}