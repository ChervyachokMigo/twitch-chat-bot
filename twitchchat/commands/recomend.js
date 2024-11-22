
const minimist = require('minimist');

const { ALL } = require("../constants/enumPermissions");
const { find } = require("../tools/Recommends");
const { GET_TWITCH_OSU_BIND } = require("../../DB");
const { irc_say } = require("../tools/ircManager");
const { parseArgs } = require('../../tools/tools');
const { ModsToInt, IntToMods } = require('../../osu_pps/osu_mods');

module.exports = {
    command_name: `recomend`,
    command_description: `Дать карту`,
    command_aliases: [`recomend`, `r`, `rec`],
    command_help: `recomend`,
    command_permission: ALL,
    action: async ({channelname, tags, comargs})=>{

        const args = parseArgs(comargs, '-');
		console.log('args', args);

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

        const acc_default = 100;
        let acc = acc_default;
        if (args.acc){
            acc = parseInt(args.acc);
            const acc_available = [98,99,100];
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
            const beatmap = await find({username: tags.username, acc, pp_min, pp_max, aim, speed, mods_int});

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

const formatBeatmapInfoOsu = (username, { beatmap_id, beatmapset_id, artist, title, pp_total, pp_aim, pp_speed, pp_accuracy, accuracy, mods }) => {
    const url = `[https://osu.ppy.sh/beatmapsets/${beatmapset_id}#osu/${beatmap_id} ${artist} - ${title}]`;
    const acc = `${accuracy}%`;
    const pp = `${pp_total}pp | aim: ${pp_aim}pp | speed: ${pp_speed}pp | accuracy: ${pp_accuracy}pp`;
    const mods_str = IntToMods(mods).join('+');

    return [username, url, mods_str, acc, pp].join(' > ');
}

const formatMap = ({ beatmap_id, beatmapset_id, artist, title, 
    pp_total, pp_aim, pp_speed, pp_accuracy, accuracy, stars, diff_aim, diff_speed, speed_notes, AR, OD, mods }) => {

    return [
        `${artist} - ${title}`,
        IntToMods(mods).join('+'),
        `AR: ${AR.toFixed(1)}`,
        `OD: ${OD.toFixed(1)}`,
        `${accuracy}%=${pp_total}pp`, 
        `aim=${pp_aim}pp`,
        `speed=${pp_speed}pp`,
        `accuracy=${pp_accuracy}pp`,
        `diff=${stars.toFixed(1)} ★`,
        `aim=${diff_aim.toFixed(1)} ★`,
        `speed=${diff_speed.toFixed(1)} ★`,
        `speednotes=${speed_notes}`,
        `https://osu.ppy.sh/beatmapsets/${beatmapset_id}#osu/${beatmap_id}`,
    ].join(' | ');

}