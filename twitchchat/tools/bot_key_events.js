const fs = require('fs');

const { parseArgs, object_to_args } = require('../../tools/tools');
const bind_recommend_maps = './bind_recommend_maps.json';
const keypress = require('keypress');
const recomend_command = require('../commands/recomend.js');

let last_args = null;

module.exports = {
	init: () => {

		if (!last_args) {
			last_args = JSON.parse(fs.readFileSync(bind_recommend_maps, {encoding: 'utf8'}));
			last_args.comargs = last_args.comargs.trim().split(' ');
		}

		keypress(process.stdin);

		process.stdin.on('keypress', async (ch, key) => {
			if (!key) {
				return;
			}

			if (key.name == 'r') {
				console.log('sended requests');
				await recomend_command.action(last_args);
			}

			if (key.name == 'e') {
				const args = parseArgs(last_args.comargs, '-');
				args.pp = parseInt(args.pp) + 5;
				console.log('increase pp by 5, now:', args.pp);
				last_args.comargs = object_to_args(args, '-');
			}
			
            if (key.name == 'd') {
				const args = parseArgs(last_args.comargs, '-');
				args.pp = parseInt(args.pp) - 5;
				console.log('dencrease pp by 5, now:', args.pp);
				last_args.comargs = object_to_args(args, '-');
			}
			
			if (key.ctrl && (key.name == 'c' || key.name == 'с')) {
				process.exit(0)
			}
		});

		process.stdin.setRawMode(true);
		process.stdin.resume();
	}
}
