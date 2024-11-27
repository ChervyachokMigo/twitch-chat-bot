
const minimist = require('minimist');

const { ALL } = require("../constants/enumPermissions");
const { find, buffer_size } = require("../tools/Recommends");
const { GET_TWITCH_OSU_BIND } = require("../../DB");
const { irc_say } = require("../tools/ircManager");
const { parseArgs } = require('../../tools/tools');
const { ModsToInt, IntToMods } = require('../../osu_pps/osu_mods');
const { Gamemode, RankedStatus } = require('osu-tools');
const { Gamemodes, get_beatmap_pps_by_id } = require('../../DB/beatmaps');
const { beatmapset_url_parse } = require('../tools/beatmap_url_parse');
const { formatMap, formatBeatmapInfoOsu } = require('../tools/format_beatmap');

module.exports = {
    command_name: `pp`,
    command_description: `Дать пп карты`,
    command_aliases: [`pp`, `пп`, `beatmap_pp`],
    command_help: `pp`,
    command_permission: ALL,
    action: async ({ channelname, tags, comargs })=>{
		
        const args = parseArgs(comargs, '-');
		console.log('args', args);

        let mods_int = ModsToInt([]);
        if (args.mods){
            mods_int = ModsToInt(args.mods.split('+'));
        }

        //кому отправить
        let to_osu_user = null;
        if(args.osuname){
            to_osu_user = args.osuname;
        }

		let url = null;
		let gamemode = null;
		let beatmapset_id = null;
		let beatmap_id = null;

		if (args.url) {
			const res = beatmapset_url_parse(args.url);
			if (res.error) {
				return res;
			}
			gamemode = res.gamemode;
			beatmapset_id = res.beatmapset_id;
			beatmap_id = res.beatmap_id;
			url = args.url;
		}

		const beatmaps = await get_beatmap_pps_by_id({ beatmapset_id, beatmap_id, gamemode, mods: mods_int });

		if (!beatmaps.length) {
            return {success: '[pp] > error no founded beatmaps'}
        }

		//отправить себе, если не указано кому
		if ( !to_osu_user ){
			const osu_bind = await GET_TWITCH_OSU_BIND(tags['user-id']);
			if(osu_bind){
				to_osu_user = osu_bind.osu_name;
			}
		}

		const results = [];

		for (let i in beatmaps) {
			const beatmap = beatmaps[i];
			if (to_osu_user) {
                irc_say(to_osu_user, formatBeatmapInfoOsu({ username: tags.username, beatmap, n: parseInt(i) + 1 }) );
            }

			results.push(formatMap({ beatmap }));

		}

        return {success: results.join('\n')};
    }
}
