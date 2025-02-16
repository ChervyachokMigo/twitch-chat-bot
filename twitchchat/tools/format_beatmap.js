const { Gamemodes } = require("../../DB/beatmaps");
const { IntToMods } = require("../../osu_pps/osu_mods");

module.exports = {
	formatMap: ({ beatmap, short = false }) => {
		const res = [];

		res.push( `${beatmap.artist} - ${beatmap.title}`);
		res.push(IntToMods(beatmap.mods).join('+'));
		res.push(`${beatmap.accuracy}%=${beatmap.pp_total}pp`);
		if (beatmap.AR && short === false) 			  res.push( `AR: ${beatmap.AR.toFixed(1)}`);
		if (beatmap.OD && short === false) 			  res.push( `OD: ${beatmap.OD.toFixed(1)}`);
		if (beatmap.pp_aim && short === false) 		  res.push(`aim=${beatmap.pp_aim}pp`,);
		if (beatmap.pp_speed && short === false) 	  res.push(`speed=${beatmap.pp_speed}pp`);
		if (beatmap.pp_accuracy && short === false)   res.push(`accuracy=${beatmap.pp_accuracy}pp`);
		if (beatmap.pp_difficulty && short === false) res.push(`diff=${beatmap.pp_difficulty}pp`);
		if (beatmap.pp_ur && short === false) 		  res.push(`ur=${beatmap.pp_ur}`);
		if (beatmap.stars)							  res.push(`diff=${beatmap.stars.toFixed(1)} ★`);
		if (beatmap.diff_aim && short === false)      res.push(`aim=${beatmap.diff_aim.toFixed(1)} ★`);
		if (beatmap.diff_speed && short === false)    res.push(`speed=${beatmap.diff_speed.toFixed(1)} ★`);
		if (beatmap.diff_stamina && short === false)  res.push(`stamina=${beatmap.diff_stamina.toFixed(1)} ★`);
		if (beatmap.diff_rhythm && short === false)	  res.push(`rhythm=${beatmap.diff_rhythm.toFixed(1)} ★`);
		if (beatmap.diff_colour && short === false)   res.push(`colour=${beatmap.diff_colour.toFixed(1)} ★`);
		if (beatmap.diff_peak && short === false)	  res.push(`peak=${beatmap.diff_peak.toFixed(1)} ★`);
		if (beatmap.speed_notes && short === false)	  res.push(`speednotes=${beatmap.speed_notes}`);

		res.push(`https://osu.ppy.sh/beatmapsets/${beatmap.beatmapset_id}#${Gamemodes[beatmap.gamemode]}/${beatmap.beatmap_id}`);

		return res.join(' | ');

	},

	formatBeatmapInfoOsu: ({ username, beatmap, n }) => {
		const res = [];

		const url = `https://osu.ppy.sh/beatmapsets/${beatmap.beatmapset_id}#${Gamemodes[beatmap.gamemode]}/${beatmap.beatmap_id}`;
		const title = `${beatmap.artist} - ${beatmap.title}`;

		res.push(`[${Gamemodes[beatmap.gamemode]}, ${n}] ${username} > [${url} ${title}]`);
		res.push(IntToMods(beatmap.mods).join('+'));
		res.push(`${beatmap.accuracy}%`);
		res.push(`${beatmap.pp_total}pp`);

		if (beatmap.stars) res.push(`${beatmap.stars.toFixed(1)} ★`);

		return res.join(' | ');
	}
}