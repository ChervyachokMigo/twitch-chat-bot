const { MYSQL_SAVE } = require("mysql-tools");

this.channels = [];

module.exports = {
    add: async (channel) => {
        const channelname = channel.replace('#', '');
        this.channels.push(channelname);
        await MYSQL_SAVE('twitch_banned', {channelname});
    },

    isNotExists: (channel) => {
        return this.channels.indexOf(channel) === -1
    }

}