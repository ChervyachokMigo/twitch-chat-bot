
const minimist = require('minimist');

const { ALL } = require("../constants/enumPermissions");
const { find } = require("../tools/Recommends");
const { GET_TWITCH_OSU_BIND } = require("../../DB");
const { irc_say } = require("../tools/ircManager");

module.exports = {
    command_name: `recomend`,
    command_description: `Дать карту`,
    command_aliases: [`recomend`, `r`, `rec`],
    command_help: `recomend`,
    command_permission: ALL,
    action: async ({channelname, tags, comargs})=>{
        
        const args = minimist(comargs);

        let n = 1;
        if (args.n){
            n = parseInt(args.n)
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
        }

        const pp_diff_default = 10;
        let pp_diff = pp_diff_default;
        if (args.pp_diff){
            pp_diff = parseInt(args.pp_diff);
        }

        
        let pp_min = Math.floor(pp - pp_diff * 0.5);
        if (args.pp_min){
            pp_min = parseInt(args.pp_min);
        }

        let pp_max = Math.floor(pp + pp_diff * 0.5);
        if (args.pp_max){
            pp_max = parseInt(args.pp_max);
        }

        let aim = null
        if (args.aim){
            aim = Number(args.aim);
        }

        let speed = null
        if (args.speed){
            speed = Number(args.speed);
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
            const beatmap = await find({username: tags.username, acc, pp_min, pp_max, aim, speed});

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
    
    const url = `[https://osu.ppy.sh/beatmapsets/${beatmapset_id}#osu/${beatmap_id} ${artist} - ${title}] >`;
    const pp = `${accuracy}% > ${pp_total}pp | aim: ${pp_aim}pp | speed: ${pp_speed}pp | accuracy: ${pp_accuracy}pp`;

    return `${username} > ${url} ${pp}`;
}

const formatMap = ({ beatmap_id, beatmapset_id, artist, title, 
    pp_total, pp_aim, pp_speed, pp_accuracy, accuracy, stars, diff_aim, diff_speed, speed_notes, AR, OD, mods }) => {

    return [
        `${artist} - ${title}`,
        `AR: ${AR}`,
        `OD: ${OD}`,
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