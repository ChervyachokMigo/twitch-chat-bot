const { v2 } = require ('osu-api-extended');

const { GetGamemodeToInt, get_beatmap_pps_by_id } = require('../DB/beatmaps.js');

const { checkTokenExpires } = require (`./requests.js`);
const log = require('../tools/log.js');
const { getFixedFloat } = require('../tools/tools.js');

async function get_score_info_bancho (score_id, gamemode) {
    if (!await checkTokenExpires('osu')){
        log('cant get osu token');
        return false;
    };

    const score_info = await v2.scores.details(score_id, gamemode);

    if (score_info.error){
        return false;
    }

    return score_info;
}

module.exports = {
    getBeatmapInfoByUrl: async (url) => {

        const url_parts = url.match(/https:\/\/osu\.ppy\.sh\/beatmapsets\/([0-9]+)(\#([A-Za-z]+)\/([0-9]+)?)*/i );

        if (url_parts === null) {
            return {error: `ссылка не битмапсет`};
        }

        const request = {
            beatmapset_id: url_parts[1]? Number(url_parts[1]): null,
            gamemode: url_parts[3]? GetGamemodeToInt(url_parts[3]): null,
            beatmap_id: url_parts[4]? Number(url_parts[4]): null
        };

        if ( ! (request.beatmapset_id && request.beatmap_id) ){
            return { error: `ссылка не полная` };
        }

        let beatmap_pps = await get_beatmap_pps_by_id({...request });
        beatmap_pps.sort( (a, b) => b.accuracy - a.accuracy );

        /*if (!beatmap){
            const beatmapset_info = await get_beatmap_info_bancho( request.beatmapset_id );

            if (!beatmapset_info){
                return {error: `невозможно получить информацию о карте с банчо ${request.beatmapset_id}`};
            }

            beatmap = beatmapset_info.beatmaps.find( b => Number(b.id) === Number(request.beatmap_id));

            if ( !beatmap ) {
                return {error: `карта ${request.beatmap_id} не найдена в битмапсете ${request.beatmapset_id}`};
            }

            beatmap.beatmap_id = beatmap.id;
            beatmap.title = beatmapset_info.title;
            beatmap.artist = beatmapset_info.artist;
            beatmap.difficulty = beatmap.version;
            beatmap.creator = beatmapset_info.creator;
            beatmap.gamemode = beatmap.mode;
            beatmap.ranked = beatmap.status;
            beatmap.md5 = beatmap.checksum;
        }*/
        
    // const beatmap_pps = await get_performance_points_beatmap_mysql({ md5: beatmap.md5 });

        //let  pps = [];

        if (beatmap_pps.length === 0) {
            /*const result = await get_not_existed_beatmap({
                id: Number(request.beatmap_id) , 
                md5: md5, 
                mode: request.gamemode });

            if (result.error) {
                console.error(result.error);
            } else {
                pps = result.pps.map ( calc_info => { return {
                    acc: Math.round(calc_info.score.accuracy),
                    pp: Math.round(calc_info.performance_attributes.pp)
                }});
                
            }*/
            return {error: `карта ${request.beatmap_id} не найдена`};
        }

        return {success: {
                url: url_parts[0], pps: beatmap_pps
                /*id: beatmap.beatmap_id,
                md5: beatmap.md5,
                artist: beatmap.artist, 
                title: beatmap.title,
                diff: beatmap.difficulty,
                creator: beatmap.creator,
                mode: beatmap.gamemode,
                status: beatmap.ranked,*/
                //length: beatmap.hit_length,
                //max_combo: beatmap.max_combo,
                //bpm: beatmap.bpm,
                //stars: beatmap.difficulty_rating,
                //ar: beatmap.ar,
                //cs: beatmap.cs,
                //od: beatmap.accuracy,
                //hp: beatmap.drain,
                //beatmapset_mode: request.gamemode,
                //pps
            }
        }
    },

    getScoreInfoByUrl: async (url) => {
        
        const url_parts = url.match(/https:\/\/osu\.ppy\.sh\/scores\/([A-Za-z]+)\/([0-9]+)*/i );

        if (url_parts === null) {
            return {error: `ссылка не скор`};
        }

        const request = {
            gamemode: url_parts[1],
            score_id: url_parts[2]
        };

        if ( ! (request.gamemode && request.score_id) ){
            return {error: `ссылка не полная`};
        }

        const score_info = await get_score_info_bancho(request.score_id, request.gamemode);

        if ( ! score_info){
            return {error: `невозможно получить информацию о скоре с банчо ${request.score_id} или он не существует`};
        }

        return {success: {
                username: score_info.user.username,
                mode: score_info.mode,
                rank: score_info.rank,
                rank_global: score_info.rank_global,
                mods:  score_info.mods.length === 0? 'No Mods': score_info.mods.join('+'),
                accuracy: (Math.round(Number(score_info.accuracy) * 10000) / 100).toFixed(2),
                score_combo: score_info.max_combo,
                beatmap_combo: score_info.beatmap.max_combo,
                pp: Math.round(Number(score_info.pp)),
                count300: score_info.statistics.count_300,
                count100: score_info.statistics.count_100,
                count50: score_info.statistics.count_50,
                countgeki: score_info.statistics.count_geki,
                countkatu: score_info.statistics.count_katu,
                count0: score_info.statistics.count_miss,
                beatmap_artist: score_info.beatmapset.artist,
                beatmap_title: score_info.beatmapset.title,
                beatmap_diff: score_info.beatmap.version,
                beatmap_creator: score_info.beatmapset.creator,
            }
        }
    },

    getOsuUserData: async (userid, mode = 'osu')=>{

        if (!await checkTokenExpires('osu')){
            log('cant get osu token');
            return false;
        };
    
        var data = await v2.user.details(userid, mode);
        if (data.error === null){
            return data;
        }
    
        if (data.error || typeof data.statistics === 'undefined' || typeof data.statistics.pp === 'undefined'){
            return {error: null}
        }
    
        return {
            userid: Number(data.id),
            username: data.username,
            pp: parseInt(getFixedFloat(data.statistics.pp, 2)*100),
            rank: parseInt(data.statistics.global_rank),
            acc: parseInt(getFixedFloat(data.statistics.hit_accuracy,2)*100),
            countryrank: parseInt(data.statistics.country_rank),
            lastactive: parseInt(new Date(data.last_visit).valueOf()/1000),
            online: data.is_online,
            followers: parseInt(data.follower_count),
            mainmode: data.playmode,
            avatar: data.avatar_url
        };
    }
}