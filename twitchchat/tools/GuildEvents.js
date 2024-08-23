const { EventEmitter } = require('events');
const { default: axios } = require('axios');
const { TWITCHCHAT_ROUTER_PORT } = require('../../config');
const log = require('../../tools/log');

this.ev = new EventEmitter();

module.exports = {
    twitchchat_load_events: () => {
		log('запуск событий чата', 'initialisation');
        const events = ['runCommand', 'lastCommands', 'chatMention', 'newChatMessage'];

        /*for (let eventname of events){
            this.ev.on(eventname, async ({channelname, text}) => {
                await axios.post( `http://localhost:${TWITCHCHAT_ROUTER_PORT}/send`, { eventname, channelname, text });
            });
        }*/

    },

    emit: (name, args) => {
        this.ev.emit(name, args);
    }
}