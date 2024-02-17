
const { spawn } = require('child_process');
const util = require('util');
const os = require('os');
const { calc_result_parse } = require('./osu_pps/calc_data_saver');

const _psToUTF8 = '$OutputEncoding = [System.Console]::OutputEncoding = [System.Console]::InputEncoding = [System.Text.Encoding]::UTF8 ; ';

const powershell = spawn('powershell.exe', ['-NoLogo', '-InputFormat', 'Text', '-NoExit', '-ExecutionPolicy', 'Unrestricted', '-Command', '-'], {
    stdio: 'pipe',
    windowsHide: true,
    maxBuffer: 1024 * 20000,
    encoding: 'UTF-8',
    env: util._extend({}, process.env, { LANG: 'en_US.UTF-8' }),
    
});

powershell.on('error', function (e) {
    console.log('POWERSHELL ERROR:', e.toString('utf8'))
});

powershell.stderr.on('data', function (data) {
    console.log('POWERSHELL ERROR:', data.toString('utf8'));
});

powershell.on('close', function () {
    powershell.kill();
});

powershell.stdout.on('data', function (data) {
    if (data.length>0){
        calc_result_parse({last_command, data: JSON.parse(data.toString('utf8').trim())});
    }
});

let last_command = null;

/*        path: calc_exe, 
        action: 'simulate', 
        gamemode_str: gamemode_str,
        gamemode,
        mods_cmd,
        mods,
        mods_int: ModsToInt(mods),
        is_json: '-j',
        include: `${path.join(osu_md5_storage, `${md5}.osu`)}`,
        acc_args,
        acc
*/

function powershell_call({path, action, gamemode_str, gamemode, mods, mods_int, is_json, include, acc_args, acc}){
    try {
        let mods_cmd = ['-m CL'];
        if ( mods.length > 0){
            mods_cmd = [...mods.map( x => `-m ${x}`)];
        }

        last_command = {path, action, gamemode_str, gamemode, mods, mods_int, is_json, include, acc_args, acc};

        powershell.stdin.write(_psToUTF8 + [path, action, gamemode_str, ...mods_cmd, is_json, include, acc_args].join(' ') + os.EOL);
    } catch (e) {
        console.log(e.toString('utf8'));
    }
}


module.exports = {
    powershell_call,
}