const storage = require("osu-md5-storage-archive");
const fs = require("fs");

const { init_md5_cache, get_md5_list, get_all_beatmap_params, get_md5_id } = require("./beatmaps");
const { parse_osu_file, osu_file_beatmap_property, beatmap_data_hit_object_type } = require("osu-tools");
const { MYSQL_SAVE } = require("mysql-tools");
const { beatmaps_cache } = require("../settings");
const path = require("path");

const props = [
	osu_file_beatmap_property.hit_objects,
	osu_file_beatmap_property.total_time,
	osu_file_beatmap_property.drain_time,
	osu_file_beatmap_property.break_time,
	osu_file_beatmap_property.bpm,
	osu_file_beatmap_property.stream_difficulty,
];

const max_int32 = Math.abs(Math.pow(2, 31) - 1);

module.exports = {
	update_beatmap_params: async (is_update_beatmaps = true) => {

		if( !is_update_beatmaps ) {
            console.log('Skipped updating beatmap params');
            return;
        }

		const filelist = storage.get_filelist({ is_raw: true, is_set: true});
		const part_size = Math.trunc(filelist.size / 1000);

		const beatmap_list_cache = new Set(fs.readdirSync(beatmaps_cache, { encoding: 'utf8' }).map( v => v.slice(0, -4) ));

		await init_md5_cache();

		const db_beatmap_params = new Set((await get_all_beatmap_params()).map( v => v.md5_int ));

		var i = 0;
		var mysql_save_data = [];

		for (let md5 of filelist) {
			i++;

			if (i % part_size === 0) {
				console.log('processed:', i, '/', filelist.size); 
			}
			
			if (!md5) {
				console.log(`Beatmap ${md5} is null`);
                continue;
			}

			const id = await get_md5_id(md5);
			
			if (db_beatmap_params.has(id)) {
				//console.log(`Beatmap ${md5} already processed`);
				continue;
			}

			const storage_idx = storage.findIndex(md5);

			if (storage_idx === -1){
				console.log(`Beatmap ${md5} not found in storage`);
				continue;
			}

			const filepath = path.join(beatmaps_cache, md5 + '.osu');

			if( !beatmap_list_cache.has(md5) ){
				const file = await storage.read_one(md5);
				fs.writeFileSync(filepath, file.data);
				//process.stdout.write(`Extracted ${md5} from storage\r`);
			}
		
			const beatmap_data = parse_osu_file(filepath, props, { is_hit_objects_only_count: false });

			if (!beatmap_data.general || !beatmap_data.general.bpm) {
				console.log('No bpm found for', md5);
				continue;
			}

			const mysql_data = {
				md5: id,
				bpm_min: Math.trunc(beatmap_data.general.bpm.min),
				bpm_max: beatmap_data.general.bpm.max > max_int32 ? max_int32 : Math.trunc(beatmap_data.general.bpm.max),
				bpm_avg: beatmap_data.general.bpm.avg > max_int32 ? max_int32 : Math.trunc(beatmap_data.general.bpm.avg),
				total_time: Math.trunc(beatmap_data.general.total_time),
				drain_time: Math.trunc(beatmap_data.general.drain_time),
				break_time: Math.trunc(beatmap_data.general.break_time),

				hit_count: (beatmap_data.hit_objects.hit_objects.filter(v => v.type === beatmap_data_hit_object_type.hitcircle) || []).length,
				slider_count: (beatmap_data.hit_objects.hit_objects.filter(v => v.type === beatmap_data_hit_object_type.slider) || []).length,
				spinner_count: (beatmap_data.hit_objects.hit_objects.filter(v => v.type === beatmap_data_hit_object_type.spinner) || []).length,

				stream_difficulty: beatmap_data.difficulty.stream_difficulty > max_int32 ? max_int32 : beatmap_data.difficulty.stream_difficulty,
			}

			mysql_save_data.push(mysql_data);

			if (mysql_save_data.length >= 100) {
				await MYSQL_SAVE('beatmap_params', mysql_save_data, true);
				mysql_save_data = [];
			}

		} // end for

		// save last part
		await MYSQL_SAVE('beatmap_params', mysql_save_data, true);
		
	}
}