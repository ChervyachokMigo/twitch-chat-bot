const ircClient = require('node-irc');
const { osu_irc_args } = require('../../config');
const [ server, port, username, password ] = osu_irc_args;

let client = null;

module.exports = {
    init_osu_irc: () => {
		console.log('connection osu irc');
        client = new ircClient(server, port, username, username, password);
        client.verbosity = 0;
        client.connect();
		/*client.on('PRIVMSG', (args) => {
			console.log('privmsg:' , args)
		});*/
    },
	
    irc_say: (username, text)=> {
        client.say(username, text);
    }
}
