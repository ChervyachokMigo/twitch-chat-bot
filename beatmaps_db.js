const storage = require("osu-md5-storage-archive");
const { md5_stock_compare, make_beatmaps_db } = require("./osu_pps/beatmaps_md5_stock");
const { calc_from_mysql } = require("./osu_pps/beatmaps_pp_calc");
const { osuPath, osu_md5_storage, osu_laser_files, osu_laser_realm, is_start_calculation, is_start_update_beatmaps } = require("./settings");
const log = require("./tools/log");
const { update_beatmap_params } = require("./DB/beatmap_params");

const moduleName = 'Beatmaps db';

module.exports = {
    init: async (is_force_update_params = null, is_force_calculation = null ) => {
		let is_update_params = false;
		if (is_force_update_params === null) {
            is_update_params = is_start_update_beatmaps;
        } else {
			is_update_params = is_force_update_params;
		}

		let is_calculation = false;
		if (is_force_calculation === null) {
			is_calculation = is_start_calculation;
		} else {
			is_calculation = is_force_calculation;
		}

		if (!process.env.api_key){
			console.log('Error: No API key provided.');
            process.exit();
		}
		
		storage.set_api_key(process.env.api_key);

		storage.set_path({ 
			source: osu_md5_storage,
			destination: osu_md5_storage,
			osu: osuPath,
			laser_files: osu_laser_files
		});

		storage.prepare();

		storage.laser.init_realm(osu_laser_realm);

		const new_files = await storage.laser.update_storage_from_realm();
		await storage.check_files_by_list(new_files);

		await update_beatmap_params(is_update_params);

		if(is_calculation){
			log('calculate pp', moduleName);
			await calc_from_mysql('osu');
			await calc_from_mysql('taiko');
		} else {
			log('calcing pp is switched off, check settings');
		}
    }


}