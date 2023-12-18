const { md5_stock_compare, make_beatmaps_db } = require("./osu_pps/beatmaps_md5_stock");
const { calc_from_mysql } = require("./osu_pps/beatmaps_pp_calc");
const log = require("./tools/log");

const moduleName = 'Beatmaps db';

module.exports = {
    init: async () => {
        //log('scan songs', moduleName);
        //make_beatmaps_db();
        log('comparing stock', moduleName)
        md5_stock_compare();
        log('calculate pp', moduleName)
        await calc_from_mysql();
    }


}