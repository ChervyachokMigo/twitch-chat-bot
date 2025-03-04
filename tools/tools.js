const { existsSync, mkdirSync } = require('node:fs');

const { SELF, CHANNEL, ALL } = require('../twitchchat/constants/enumPermissions');

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

	object_to_args: (obj, spliter = '--') => {
		let result = [];
        for (let key in obj){
            result.push(`${spliter}${key}`);
			result.push(obj[key]);
        }
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

    getFixedFloat: function (num, digits){
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

    onlyUnique: function (arr){
        return arr.filter(onlyUnique)
    },

}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}