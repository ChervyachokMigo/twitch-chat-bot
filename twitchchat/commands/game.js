
const change_game = require("../../requests/change_game.js");
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

		if (!founded_game) {
            return {error: '[game] > Неизвестная игра'}
        }

		await change_game(user_id, founded_game.id);

        return  true;
    }
}