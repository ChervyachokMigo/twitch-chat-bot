const express = require('express');
const express_subdomain = require('express-subdomain');
const { existsSync, mkdirSync, readdirSync } = require(`fs`);

const path = require('path');
const { SELF, CHANNEL, ALL } = require('../twitchchat/constants/enumPermissions');

const keyboard_map = {'q' : 'й', 'w' : 'ц', 'e' : 'у', 'r' : 'к', 't' : 'е', 'y' : 'н', 'u' : 'г', 'i' : 'ш', 'o' : 'щ', 'p' : 'з', '[' : 'х', ']' : 'ъ', 
'a' : 'ф', 's' : 'ы', 'd' : 'в', 'f' : 'а', 'g' : 'п', 'h' : 'р', 'j' : 'о', 'k' : 'л', 'l' : 'д', ';' : 'ж', '\'' : 'э', 
'z' : 'я', 'x' : 'ч', 'c' : 'с', 'v' : 'м', 'b' : 'и', 'n' : 'т', 'm' : 'ь', ',' : 'б', '.' : 'ю','/':'.',
'Q' : 'Й', 'W' : 'Ц', 'E' : 'У', 'R' : 'К', 'T' : 'Е', 'Y' : 'Н', 'U' : 'Г', 'I' : 'Ш', 'O' : 'Щ', 'P' : 'З',
'A' : 'Ф', 'S' : 'Ы', 'D' : 'В', 'F' : 'А', 'G' : 'П', 'H' : 'Р', 'J' : 'О', 'K' : 'Л', 'L' : 'Д', ';' : 'Ж', 
'Z' : '?', 'X' : 'ч', 'C' : 'С', 'V' : 'М', 'B' : 'И', 'N' : 'Т', 'M' : 'Ь', 
'й':'q','ц':'w','у':'e','к':'r','е':'t','н':'y','г':'u','ш':'i','щ':'o','з':'p','х':'[','ъ':']',
'ф':'a','ы':'s','в':'d','а':'f','п':'g','р':'h','о':'j','л':'k','д':'l','ж':';','э':'\'',
'я':'z','ч':'x','с':'c','м':'v','и':'b','т':'n','ь':'m','б':',','ю':'.','.':'/',
'Й':'Q','Ц':'W','У':'E','К':'R','Е':'T','Н':'Y','Г':'U','Ш':'I','Щ':'O','З':'P','Х':'[','Ъ':']',
'Ф':'A','Ы':'S','В':'D','А':'F','П':'G','Р':'H','О':'J','Д':'L','Ж':';','Э':'\'',
'Я':'Z','Ч':'X','С':'C','М':'V','И':'B','Т':'N','Ь':'M','Б':',','Ю':'.'}

const emoji_regex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g

module.exports = {
    parseArgs: (args, spliter = '--') => {
        const strings = args.join(' ').trim().split(spliter).map( v=> v.trim().replace(/(\"|\')/g, '') );
        let result = {};
        strings.map ( v => {
            if (v) {
                let s = v.split(' ')
                const key = s.shift();
                const values = s.join(' ');
                result[key] = values;
            }
        });
        return result;
    },

    PermissionToInt: (perm) => {
        switch (perm.toLowerCase()){
            case 'self':
            case 'myself':
                return SELF;
            case 'chan':
            case 'channel':
                return CHANNEL;
            case 'all':
                return ALL;
            default:
                console.log('unknown permission, setted self');
                return SELF;
        }
    },

    getFixedFloat:function (num, digits){
        return Number(num).toFixed(digits);
    },
    
    setInfinityTimerLoop: function (func, timeSec){
        return setInterval(func, timeSec * 1000 + (5000 * Math.random()) );
    },

    GET_VALUES_FROM_OBJECT_BY_KEY: function (arrayobject, valuekey){
        var res = [];
        for (let data of arrayobject){
            res.push(data[valuekey]);
        }
        return res;
    },

    ObjToString: function (obj) {
        let str = '';
        for (const [p, val] of Object.entries(obj)) {
            str += `**${p}** - **${val}**\n`;
        }
        return str;
    },

    SortObjectByValues: function (obj, asc = true){
        if (asc == true){
            return Object.fromEntries(Object.entries(obj).sort(([,a],[,b]) => a-b))
        } else {
            return Object.fromEntries(Object.entries(obj).sort(([,a],[,b]) => b-a))
        }
    },

    CreateFolderSync_IsNotExists: function(path){
        try{
            if (!existsSync(path)) {
                mkdirSync(path, {recursive: true}); 
            }
            return true
        } catch (e){
            console.log(`Cannot create folder: ${path}`)
            console.log(e);
            return false
        }
    },

    getBooleanFromString: function(text){
        switch (typeof text){
            case 'string':
                switch (text){
                    case 'true':
                    case '1':
                        return true;
                    case 'false':
                    case '0':
                        return false;
                    case '':
                        return undefined;
                    default:
                        if (!isNaN(Number(text))){
                            return true;
                        }
                        return undefined;
                }
            case 'boolean':
                return text;
            case 'number':
                if (text == 0){
                    return false;
                } else {
                    if (isNaN(text)){
                        return undefined;
                    } else {
                        return true;
                    }
                }
            default:
                return undefined;
        }
    },

    objectFlipKeysWithValues: function(obj) {
        return Object.keys(obj).reduce((ret, key) => {
          ret[obj[key]] = key;
          return ret;
        }, {});
    },

    getObjectKeyByValue: function (value, object){
        for(var key in object) {
          if(object[key] === value) return key;
        }
        return false;
    },

    onlyUnique: function (arr){
        return arr.filter(onlyUnique)
    },

    splitMessage: function(text){
        var strings = text.split('\n');
        var result = [];
        var resultBuffer = '';
        for( let s of strings ){
            if ( resultBuffer.length + s.length > 2000 ){
                result.push(resultBuffer.slice());
                resultBuffer = '';
            }
            resultBuffer += s + '\n';
        }
        if ( resultBuffer.length > 0 ){
            result.push(resultBuffer.slice());
        }
        return result;
    },

    isJSON: (str) => {
        try {
            JSON.parse(str.toString());
        } catch (e) {
            return false;
        }
        return true;
    },

    groupBy: (collection, property) => {
        var i = 0, val, index, values = [], result = [];
        for (; i < collection.length; i++) {
            val = collection[i][property];
            index = values.indexOf(val);
            if (index > -1)
                result[index].push(collection[i]);
            else {
                values.push(val);
                result.push([collection[i]]);
            }
        }
        return result;
    },
    
    listenWebFolder: ( weblink, folderpath, router) => {
        const absolute_folderpath = path.resolve(folderpath);
        for (const filename of readdirSync(absolute_folderpath)){
            const url = urlFromPath(path.join( path.sep, weblink, filename));
            const _filepath = path.join(absolute_folderpath, filename);
            module.exports.listenWebFile(url, _filepath, router);
        }
    },

    listenWebFile: (link, filepath, router ) => {
        const absolute_filepath = path.resolve(filepath);
        console.log('Listen file: ', link, '->',  absolute_filepath);
        router.get(link, (req, res) => {
            res.sendFile(absolute_filepath);
        });
    },

    set_router_subdomain: (app, subdomain) => {
        var router = express.Router();
        app.use(express_subdomain(subdomain, router));
        return router;
    },

}

function urlFromPath(path_str){
    return path_str.replace(/\\/g, '/');
}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}