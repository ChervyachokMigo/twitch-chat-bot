
const change_title = require("../../requests/change_title.js");
const { SELF } = require("../constants/enumPermissions.js");

module.exports = {
    command_name: `title`,
    command_description: ``,
    command_aliases: [`title`, `заголовок`, `тайтл`, `название`],
    command_help: `title`,
    command_permission: SELF,
    action: async ({channelname, tags, comargs})=>{
		const title_text = comargs.join(' ');

		const user_id = tags['user-id'];

		await change_title(user_id, title_text);

        return  true;
    }
}