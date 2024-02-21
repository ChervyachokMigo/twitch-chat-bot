const { select_mysql_model } = require("../../DB/defines");
const { PermissionToInt, parseArgs } = require("../../tools/tools");
const { SELF } = require("../constants/enumPermissions");

module.exports = {
    command_name: `create_command`,
    command_description: `Создать команду`,
    command_aliases: ['create_command', 'custom_command', 'new_command', 'add_command'],
    command_help: `create_command`,
    command_permission: SELF,
    action: async ({channelname, tags, comargs})=>{
        const {text, perm, names} = parseArgs( comargs );
        
        if (names && text && perm){
            const custom_commands = select_mysql_model('custom_commands');
            const req = {
                name: names.trim().split(' ').shift(),
                channelname
            };

            let response = (await custom_commands.findOrCreate({ 
                where: req,
                defaults: { text, perm: PermissionToInt(perm) },
                raw: false,
            }))

            const command = response.shift().dataValues;
            const is_created = response.shift();

            if (is_created === false) {
                await custom_commands.update({ text, perm: PermissionToInt(perm) }, { where: req });
            }

            for (let name of names.trim().split(' ') ) {
                const command_aliases = select_mysql_model('command_aliases');

                await command_aliases.findOrCreate({ 
                    where: { command_id: command.id, name },
                });

            }

            return  {success: `new command created` };
        }

        return  {error: 'не указан один из аргументов'};
    }
}


