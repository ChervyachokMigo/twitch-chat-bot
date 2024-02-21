const { readdirSync } = require('fs');
const log  = require('../../tools/log');
const { select_mysql_model } = require('../../DB/defines');

const command_aliases = select_mysql_model('command_aliases');
const custom_commands = select_mysql_model('custom_commands');

this.commands = [];

module.exports = {
    loadTwitchChatCommands: () => {
        log('Загрузка доступных комманд', 'Twitch Commands');
        const command_files = readdirSync(`twitchchat/commands`, {encoding:'utf-8'});
    
        this.commands = [];

        for (const command_file of command_files){
            log('Загрузка команды: ' + command_file ,'Twitch Commands');
            const { command_aliases, command_description, command_name, command_help, command_permission, action } = require(`../commands/${command_file}`);

            this.commands.push({
                filename: command_file,
                name: command_name,
                desc: command_description,
                alias: command_aliases,
                help: command_help,
                permission: command_permission,
                action
            });
        }

    },

    runCommand: async (requested_command, args) => {
        for (const command of this.commands){
            if (command.alias.indexOf(requested_command) > -1){
                if (args.user_permission <= command.permission){
                    return await command.action(args);
                } else {
                    return {permission: `Запрещено выполнить команду`}
                }
            }
        }

        const custom_command_names = await command_aliases.findAll({ raw: true });
        
        for (let {name, command_id} of custom_command_names){
            if (name === requested_command){
                const commands = await custom_commands.findAll({ where: { id: command_id }, raw: true });
                for (let command of commands){
                    if (command.id === command_id && command.channelname === args.channelname){
                        return {success: command.text}
                    }
                }
            }
        }

        return false; 
    },

    viewCommands: () => {
        console.log(this.commands);
    }
}