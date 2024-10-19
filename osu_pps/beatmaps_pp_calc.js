const { spawn, execSync, exec } = require("node:child_process")
const path = require("node:path");
const fs = require("node:fs");
const keypress = require('keypress');
const { cpuUsage } = require('os-utils');

const { ModsToInt } = require('./osu_mods');

const { osu_md5_storage, 
    mysql_chunk_size, 
    calc_MaxExecuting, 
    calc_StartExecuting,
    is_key_events,
	beatmaps_cache
} = require("../settings");

const { download_by_md5_list } = require("./download_beatmaps_diffs");
const actions = require("./consts/actions");
const { get_beatmap_id, GetGamemodeToInt, Gamemodes } = require("../DB/beatmaps");
const { powershell_call } = require("../powershell.js");
const { save_calculated_data, calculated_data_length, calc_result_add } = require("./calc_data_saver.js");

const recomend_command = require('../twitchchat/commands/recomend.js');
const { select_mysql_model } = require("mysql-tools");
const { CreateFolderSync_IsNotExists } = require("../tools/tools.js");
const storage = require("osu-md5-storage-archive");

const calc_exe = path.join(__dirname,'../bin/pp_calculator/PerformanceCalculator.exe');
const calc_dll = path.join('P:\\PerformanceCalculator.dll');

const bind_recommend_maps = './bind_recommend_maps.json';

const ranked_status = {
    ranked: 4
}

//20 - 47, 1:33
//15 - 48
//12 - 46, 1:34
//10 - 49, 1:39

let maxExecuting = calc_StartExecuting;

let next_actions = [];
this.current_actions = 0;

this.toggle_explorer = true;

let beatmaps_failed = [];

let calculated_osu_beatmaps = null;
let actions_max = null;
let started_date = null;
let ended_count = null;

const cpu_usage = async () => {
    return new Promise ( res => {
        cpuUsage( (v) => {
            res (v * 100);
        });
    });
}

const kill_process = (appName) => {
    execSync(`taskkill /im ${appName} /F`);
}

const ActionsController =  async () => {

    if (this.current_actions >= maxExecuting){
        return;
    }

    let completed = actions_max - next_actions.length;

    if (next_actions.length === 0) {
        if (!ended_count){
            ended_count = this.current_actions;
        }
        if (ended_count){
            ended_count = ended_count - 1;
        }
        await save_calculated_data();

        if( actions_max > 0 ){
            console.log(`completed: ${(completed/actions_max*100).toFixed(1)} %`);
        }

        return;
    }

    if ( calculated_data_length() > mysql_chunk_size && next_actions.length > 0){
        await save_calculated_data();
        
        if (actions_max > 0 ){
            console.log(`completed: ${(completed/actions_max*100).toFixed(1)} %`);
        }
    }

    while (this.current_actions < maxExecuting){
        let args = next_actions.shift();
        if (args){
            this.current_actions++;
            calcAction (args);
        } else {
            break;
        }
    }
}

const calcAction = ({md5, md5_int, gamemode = 0, acc = 100, mods = []}) => {

    /*let acc_args = `-a ${acc}`;

    if (gamemode === 3){
        acc_args = `-s ${acc*10000}`
    };*/

    /*powershell_call({
        path: calc_exe, 
        action: 'simulate', 
        gamemode_str: gamemode_str,
        gamemode,
        mods,
        mods_int: ModsToInt(mods),
        is_json: '-j',
        include: `${path.join(osu_md5_storage, `${md5}.osu`)}`,
        acc_args,
        acc
    });*/

    const proc = spawn( 'dotnet', [
        calc_dll,
        'simulate', 
        Gamemodes[gamemode],
        ...mods.length > 0? mods.map( x => `-m ${x}`): ['-m CL'],
        '-j',
        `${path.join(osu_md5_storage, `${md5}.osu`)}`,
        `-a ${acc}`,
    ], {windowsHide: true});
    
    let result = '';

    proc.stdout.on('data', (data) => {
        if (data.length > 0){
            result += data;
        }
    })

    proc.stdout.on('close', async () =>{
        if (result.length > 0){
            try{
                calc_result_add ({ md5_int, ...JSON.parse(result), mods });
            } catch (e){
                console.error(`calc > error > something wrong with beatmap ${md5}.osu`);
            }
        }
    });

   /* 
   
    let error = '';

    proc.stderr.on('data', async (data) => {
        if (data.length > 0){
            error = data.toString();
        }
    });

    proc.stderr.on('close', async () => {
        if (error.length > 0){
            console.error(error);
            try{
                fs.copyFileSync( path.join(osu_md5_storage, `${md5}.osu`), path.join( __dirname, '..\\data\\osu_pps\\calc_error\\', `${md5}.osu`) )
            } catch (e){
                console.error(`calc > error > can not copy ${md5}.osu`)
            }
            beatmaps_failed.push(md5);
        }
    });*/

    proc.on('exit', async () => {
        this.current_actions--;
        await ActionsController();
    });

}

const get_beatmaps_by_gamemode_and_status = async (gamemode, status) => {
	const beatmap_ids = select_mysql_model('beatmap_id');
	const beatmaps_md5 = select_mysql_model('beatmaps_md5');

    return await beatmap_ids.findAll( {
        where: {
            gamemode: GetGamemodeToInt(gamemode), ranked: status
        },
        raw: true,

        include: [beatmaps_md5],

        fieldMap: {
            'beatmaps_md5.hash': 'md5',
        
            'beatmaps_md5.id': 'md5_int',
            'beatmap_id.md5': 'md5_int',

            'beatmap_id.beatmap_id': 'beatmap_id',
            'beatmap_id.beatmapset_id': 'beatmapset_id',
            'beatmap_id.gamemode': 'gamemode',
            'beatmap_id.ranked': 'ranked',
        }

    });
}

const calc_from_mysql = async (gamemode = 'osu', ranked = ranked_status.ranked) => {
    
	CreateFolderSync_IsNotExists(beatmaps_cache);

    const beatmaps_data = (await get_beatmaps_by_gamemode_and_status(gamemode, ranked))
    .sort ( (a, b) => a.md5.localeCompare(b.md5) );

    if (is_key_events){
        init_key_events();
    }

    for (let action_args of actions()){
        await init_calc_action(beatmaps_data, action_args);

        console.log(`calc complete > ${action_args.acc}% ${action_args.mods.join('+')}`);

        let beatmaps_results = await download_by_md5_list(beatmaps_failed);

        for (let {error, data, md5} of beatmaps_results){
            if (error){
                console.log(error);
                continue;
            }
            if (data){
				const filepath = path.join(beatmaps_cache, `${md5}.osu`);
                fs.writeFileSync(filepath, data, {encoding: 'utf8'});
				storage.add_one(filepath, md5);
                console.log(`saved ${md5}.osu > ${data.length} bytes`);
            }
        }
		
        beatmaps_failed = [];
		storage.save_filelist();
    }

	

}

const init_key_events = () => {

    keypress(process.stdin);

    console.log('<----------------------------------------------------------------->');
    console.log('*** CONTROL KEYS ***');
    console.log('Q\tPROCESS INFO');
    console.log('A\tDECREASE PROCESSES');
    console.log('S\tINCREASE PROCESSES');
    console.log('P\tPAUSE/RESUME');
    console.log('CTRL + C\tEXIT');
    console.log('<----------------------------------------------------------------->');


    process.stdin.on('keypress', async (ch, key) => {
        if (key && key.name == 'r') {
            console.log('sended requests');
            let request_bind_json = JSON.parse(fs.readFileSync(bind_recommend_maps, {encoding: 'utf8'}));
            request_bind_json.comargs = request_bind_json.comargs.trim().split(' ');
            await recomend_command.action(request_bind_json);
        }

        if (key && key.name == 'q' && next_actions.length > 0 && this.current_actions > 0) {
            let completed = actions_max - next_actions.length;
            let last_action_date = new Date();
            let processed_ms = last_action_date - started_date;
            let processed_sec = (processed_ms * 0.001);
            let action_speed = completed / processed_sec;
            console.log('<----------------------------------------------------------------->');
            console.log('Использование ЦП:\t', (await cpu_usage()).toFixed(0),'%');
            console.log('Выполняется процессов:\t', maxExecuting);
            console.log('Выполнено:\t\t', completed, '/', actions_max);
            console.log('Осталось:\t\t', next_actions.length, '/', actions_max);
            console.log('Скорость:\t\t', Number(action_speed.toFixed(1)), 'act/sec');
            console.log('Работет:\t\t', Math.round(processed_sec/60), 'мин');
            console.log('Заверешние через:\t', Math.round(next_actions.length/action_speed/60), 'мин');
        }
        if (key && key.name == 'p' ) {
            console.log('<----------------------------------------------------------------->');
            if (maxExecuting > 0){
                maxExecuting = 0;
                console.log('Пауза');
            } else {
                maxExecuting = calc_StartExecuting;
                console.log('Возобновление');
                await ActionsController();
            }
            console.log('Количество процессов уменьшено до', maxExecuting);
        }

        if (key && key.name == 'a' && maxExecuting > 1 ) {
            maxExecuting = maxExecuting - 1;
            console.log('<----------------------------------------------------------------->');
            console.log('Количество процессов уменьшено на', 1);
            console.log('Сейчас выполняется:\t', maxExecuting);
        }
        if (key && key.name == 's' && maxExecuting < calc_MaxExecuting ) {
            maxExecuting = maxExecuting + 1;
            console.log('<----------------------------------------------------------------->');
            console.log('Количество процессов увеличено на', 1);
            console.log('Сейчас выполняется:\t', maxExecuting);
        }
        if (key && key.name == 'e' ) {
            this.toggle_explorer = !this.toggle_explorer;
            console.log('<----------------------------------------------------------------->');
            console.log('Explorer изменен на', this.toggle_explorer);
            if (this.toggle_explorer) {
                exec(`explorer.exe`);
            } else {
                kill_process('explorer.exe');
            }
        }
        
        if (key && key.ctrl && key.name == 'c') {
            process.exit(0)
        }
    });

    process.stdin.setRawMode(true);
    process.stdin.resume();
}

const get_beatmap_pps_by_mods_and_acc = async (condition) => {

	const osu_beatmap_pp = select_mysql_model('osu_beatmap_pp');
	const beatmaps_md5 = select_mysql_model('beatmaps_md5');

    return await osu_beatmap_pp.findAll( {
        where: condition,
        raw: true,

        include: [beatmaps_md5],

        fieldMap: {
            'beatmaps_md5.hash': 'md5',
        
            'beatmaps_md5.id': 'md5_int',
            'osu_beatmap_pp.md5': 'md5_int',
        }

    });
}

const init_calc_action = async ( beatmaps = [], { acc = 100, mods } ) => {
    console.time('loading');
    console.log(`calc > loading > acc: ${acc}% > mods: ${mods.length == 0 ? 'No Mods' :mods.join('+')}`);

    const mods_int = ModsToInt(mods);

    calculated_osu_beatmaps = await get_beatmap_pps_by_mods_and_acc({ mods: mods_int, accuracy: acc });

    const calculated_set = new Set( calculated_osu_beatmaps.map( (x) =>`${x.md5_int}:${x.accuracy}:${x.mods}` ));

    console.log('loaded calculated records:', calculated_osu_beatmaps.length);

    //const actions_with_mods = actions.map( val => { return {...val, mods_int } });

    console.log('checking beatmaps', beatmaps.length);

    for (let beatmap of beatmaps){
        // md5, beatmap_id, beatmapset_id, gamemode, ranked, md5_int
        
        if (beatmap.ranked !== 4 || beatmap.gamemode !== 0){
            //console.log('skip >', beatmap.md5)
            continue;
        }

        let args = {...beatmap, acc, mods_int, mods };

        if (calculated_set.has( `${args.md5_int}:${args.acc}:${args.mods_int}`) === false) {
            next_actions.push( args );
        }
        
    }

    console.log('added actions:', next_actions.length);

    actions_max = next_actions.length;

    console.timeEnd('loading');

	console.log('prepairing',next_actions.length, 'maps');

	for (let action of next_actions) {
		const beatmap_in_cache = path.join(beatmaps_cache, action.md5 + '.osu');
		if ( fs.existsSync(beatmap_in_cache)) {
            continue;
        }

		if( !fs.existsSync(beatmap_in_cache) ){
			console.log(`Extracting ${action.md5}`);
			try{
				const file = await storage.read_one(action.md5);
				fs.writeFileSync(beatmap_in_cache, file.data);
				console.log(`Loaded ${action.md5} from storage`);
			} catch (e) {
				next_actions.splice(next_actions.findIndex( v => v.md5_int === action.md5_int ), 1);
				console.log(`Removed ${action.md5} from actions because not found in storage`);
				continue;
			}
		}
	}
	
    console.log('start calcing..');

    started_date = new Date();

    ended_count = null;

    if (this.current_actions < maxExecuting){
        await ActionsController();
    }


    return await new Promise (res => setInterval( () => { if(ended_count === 0 || ended_count < 0) { res(true)} }, 1000 ));
}



module.exports = {
    init_calc_action,
    calc_from_mysql
}

