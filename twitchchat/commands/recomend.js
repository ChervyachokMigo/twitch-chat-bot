
const minimist = require('minimist');

const { ALL } = require("../constants/enumPermissions");
const { find } = require("../tools/Recommends");
const { GET_TWITCH_OSU_BIND } = require("../../DB");
const { irc_say } = require("../tools/ircManager");
const { parseArgs } = require('../../tools/tools');
const { ModsToInt, IntToMods } = require('../../osu_pps/osu_mods');
const { Gamemode } = require('osu-tools');
const { Gamemodes } = require('../../DB/beatmaps');

module.exports = {
    command_name: `recomend`,
    command_description: `Дать карту`,
    command_aliases: [`recomend`, `r`, `rec`],
    command_help: `recomend`,
    command_permission: ALL,
    action: async ({channelname, tags, comargs})=>{

        const args = parseArgs(comargs, '-');
		console.log('args', args);

		let gamemode = Gamemode.osu;
		if (args.gamemode) {
			gamemode = parseInt(args.gamemode);
			if (gamemode !== Gamemode.osu && gamemode !== Gamemode.taiko) {
				gamemode = Gamemode.osu;
			}
		}

        let n = 1;
        if (args.n){
            n = parseInt(args.n)

            if (n > 10) {
                n = 10
            }

            if (isNaN(n) || n < 1){
                n = 1;
            }
        }

        const acc_default = 99;
        let acc = acc_default;
        if (args.acc){
            acc = parseInt(args.acc);
            const acc_available = [99];
            if (acc_available.indexOf(acc) == - 1) {
                acc = acc_default;
            }
        }

        const pp_default = 330;
        let pp = pp_default;
        if (args.pp){
            pp = parseInt(args.pp);
            if (isNaN(pp) || pp < 1) {
                pp = pp_default;
            }
        }

        const pp_diff_default = 10;
        let pp_diff = pp_diff_default;
        if (args.pp_diff){
            pp_diff = parseInt(args.pp_diff);
            if (isNaN(pp_diff) || pp_diff < 1) {
                pp_diff = pp_diff_default;
            }
        }

        
        let pp_min = Math.floor(pp - pp_diff * 0.5);
        if (args.pp_min){
            pp_min = parseInt(args.pp_min);
            if (isNaN(pp_min) || pp_min < 1) {
                pp_min = Math.floor(pp - pp_diff * 0.5);
            }
        }

        let pp_max = Math.floor(pp + pp_diff * 0.5);
        if (args.pp_max){
            pp_max = parseInt(args.pp_max);
            if (isNaN(pp_max) || pp_max < 1) {
                pp_max = Math.floor(pp + pp_diff * 0.5);
            }
        }

        let aim = null
        if (args.aim){
            aim = Number(args.aim);
            if (isNaN(aim)) {
                aim = null
            }
        }

        let speed = null
        if (args.speed){
            speed = Number(args.speed);
            if (isNaN(speed)) {
                speed = null
            }
        }

        let mods_int = ModsToInt([]);
        if (args.mods){
            mods_int = ModsToInt(args.mods.split('+'))
        }

        let notify_chat = true;
        if(typeof args.notify_chat === 'string' && args.notify_chat === 'false' || typeof args.notify_chat === 'number' && args.notify_chat === 0){
            notify_chat = false;
        }

        //кому отправить
        let to_osu_user = null;
        if(args.osuname){
            to_osu_user = args.osuname;
        }

        for (let i= 0; i < n ; i++){
            const beatmap = await find({ gamemode, username: tags.username, acc, pp_min, pp_max, aim, speed, mods_int });

            if (!beatmap){
                return {error: '[recomend] > error no founded beatmap'}
            }

            //отправить себе, если не указано кому
            if ( !to_osu_user ){
                const osu_bind = await GET_TWITCH_OSU_BIND(tags['user-id']);
                if(osu_bind){
                    to_osu_user = osu_bind.osu_name
                }
            }

            if (to_osu_user) {
                irc_say(to_osu_user, formatBeatmapInfoOsu(tags.username, beatmap) );
            }

            if (n === 1) {
                if (notify_chat){
                    return {success: formatMap(beatmap)};
                } else {
                    return {error: 'no notify chat'};
                }
            }
            
        }

        if  (n > 1) {
            return {error: 'sended '+n+' maps'}
        }

        return {error: '[recomend] > error beatmap id'}
    }
}

const formatBeatmapInfoOsu = (username, beatmap) => {
	const res = [];

	res.push(username);
    res.push(`[https://osu.ppy.sh/beatmapsets/${beatmap.beatmapset_id}#${Gamemodes[beatmap.gamemode]}/${beatmap.beatmap_id} ${beatmap.artist} - ${beatmap.title}]`);

	res.push(IntToMods(beatmap.mods).join('+'));

	res.push(`${beatmap.accuracy}%`);

	let pp = [];

	pp.push(`total: ${beatmap.pp_total}pp`);
	/*if (beatmap.pp_aim) pp.push(`aim: ${beatmap.pp_aim}pp`);
	if (beatmap.pp_speed) pp.push(`speed: ${beatmap.pp_speed}pp`);
	if (beatmap.pp_accuracy) pp.push(`accuracy: ${beatmap.pp_accuracy}pp`);
	if (beatmap.pp_difficulty) pp.push(`diff: ${beatmap.pp_difficulty}pp`);
	if (beatmap.pp_ur) pp.push(`ur: ${beatmap.pp_ur}pp`);*/

	pp = pp.join(' | ');

	res.push(pp);

	if (beatmap.stars) res.push(`${beatmap.stars.toFixed(1)} ★`);

    return res.join(' > ');
}

const formatMap = (beatmap) => {
	const res = [];

	res.push( `${beatmap.artist} - ${beatmap.title}`);
	res.push(IntToMods(beatmap.mods).join('+'));
	res.push(`${beatmap.accuracy}%=${beatmap.pp_total}pp`);
	if (beatmap.AR) 	res.push( `AR: ${beatmap.AR.toFixed(1)}`);
	if (beatmap.OD) 	res.push( `OD: ${beatmap.OD.toFixed(1)}`);
	if (beatmap.pp_aim) res.push(`aim=${beatmap.pp_aim}pp`,);
	if (beatmap.pp_speed) res.push(`speed=${beatmap.pp_speed}pp`);
	if (beatmap.pp_accuracy) res.push(`accuracy=${beatmap.pp_accuracy}pp`);
	if (beatmap.pp_difficulty) res.push(`diff=${beatmap.pp_difficulty}pp`);
	if (beatmap.pp_ur) res.push(`ur=${beatmap.pp_ur}`);
	if (beatmap.stars) res.push(`diff=${beatmap.stars.toFixed(1)} ★`);
	if (beatmap.diff_aim) res.push(`aim=${beatmap.diff_aim.toFixed(1)} ★`);
	if (beatmap.diff_speed) res.push(`speed=${beatmap.diff_speed.toFixed(1)} ★`);
	if (beatmap.diff_stamina) res.push(`stamina=${beatmap.diff_stamina.toFixed(1)} ★`);
	if (beatmap.diff_rhythm) res.push(`rhythm=${beatmap.diff_rhythm.toFixed(1)} ★`);
	if (beatmap.diff_colour) res.push(`colour=${beatmap.diff_colour.toFixed(1)} ★`);
	if (beatmap.diff_peak) res.push(`peak=${beatmap.diff_peak.toFixed(1)} ★`);
	if (beatmap.speed_notes) res.push(`speednotes=${beatmap.speed_notes}`);

	res.push(`https://osu.ppy.sh/beatmapsets/${beatmap.beatmapset_id}#${Gamemodes[beatmap.gamemode]}/${beatmap.beatmap_id}`);

    return res.join(' | ');

}