const storage = require("osu-md5-storage-archive");
const { md5_stock_compare, make_beatmaps_db } = require("./osu_pps/beatmaps_md5_stock");
const { calc_from_mysql } = require("./osu_pps/beatmaps_pp_calc");
const { osuPath, osu_md5_storage } = require("./settings");
const log = require("./tools/log");

const moduleName = 'Beatmaps db';

module.exports = {
    init: async () => {
		
		storage.set_path({ 
			source: osu_md5_storage,
			destination: osu_md5_storage,
			osu: osuPath
		});

		storage.prepare();

		await storage.md5_compare();

        log('calculate pp', moduleName)
       	//await calc_from_mysql();
    }


}