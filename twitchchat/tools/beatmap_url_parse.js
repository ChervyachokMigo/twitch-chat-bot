const { GetGamemodeToInt } = require("../../DB/beatmaps");

module.exports = {
	beatmapset_url_parse: (url) => {
		
        const url_parts = url.match(/https:\/\/osu\.ppy\.sh\/beatmapsets\/([0-9]+)(\#([A-Za-z]+)\/([0-9]+)?)*/i );

        if (url_parts === null) {
            return {error: `ссылка не битмапсет`};
        }

        const res = {
            beatmapset_id: url_parts[1]? Number(url_parts[1]): null,
            gamemode: url_parts[3]? GetGamemodeToInt(url_parts[3]): null,
            beatmap_id: url_parts[4]? Number(url_parts[4]): null
        };

        if ( !(res.beatmapset_id && res.beatmap_id) ){
            return { error: `ссылка не полная` };
        }

		return res;
	}
}