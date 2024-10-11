
const change_game = require("../../requests/change_game.js");
const get_game_id = require("../../requests/get_game_id.js");
const { SELF } = require("../constants/enumPermissions.js");
const { game_category } = require("../constants/general.js");

module.exports = {
    command_name: `game`,
    command_description: ``,
    command_aliases: [`game`, `игра`, `гейм`],
    command_help: `game`,
    command_permission: SELF,
    action: async ({channelname, tags, comargs})=>{
		const game_text = comargs.join(' ').toLowerCase();

		const user_id = tags['user-id'];

		const games = Object.values(game_category);

		const founded_game = games.find( v => v.aliases.findIndex( text => text === game_text) > -1);

		const game_info = await get_game_id({ name: founded_game ? founded_game.name : game_text });

		if (game_info.length > 0) {
			const game_id = game_info.shift().id;
			await change_game(user_id, game_id);
		} else {
			return {error: '[game] > Не удалось найти игру'};
		}

        return  true;
    }
}