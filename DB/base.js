const { select_mysql_model } = require("./defines.js");

function updateAll(Model, condition, values ){
    return Model.update(values, {where : condition, logging: false})
}

module.exports = {
    MYSQL_GET_ONE: async (action, condition) => {
        const MysqlModel = select_mysql_model(action);

        try {
            return await MysqlModel.findOne({ where: condition , logging: false, raw: true});
        } catch (e){
            if (e.code === 'ECONNREFUSED' || e.name === `SequelizeConnectionRefusedError`){
                throw new Error(`Нет доступа к базе данных.`);
            } else {
                throw new Error(e);
            }
        }
    },

    
    MYSQL_GET_ALL: async (action, params = {}, attributes = undefined) => {
        const MysqlModel = select_mysql_model(action);

        var condition = params?params:{};

        try{
            return await MysqlModel.findAll ({ where: condition, logging: false, raw: true, attributes });//order: [['id', 'DESC']] 
        } catch (e){
            if (e.code === 'ECONNREFUSED' || e.name === `SequelizeConnectionRefusedError`){
                throw new Error(`Нет доступа к базе данных.`);
            } else {
                throw new Error(e);
            }
        }    
    },

    MYSQL_UPDATE: async (action, values) => {
        const MysqlModel = select_mysql_model(action);
        var save_values = {};

        try{
            return await updateAll(MysqlModel, {guildid: values.guildid}, save_values );
        } catch (e){
            if (e.code === 'ECONNREFUSED' || e.name === `SequelizeConnectionRefusedError`){
                throw new Error(`Нет доступа к базе данных.`);
            } else {
                throw new Error(e);
            }
        }    
    },

    MYSQL_DELETE: async (action, condition) => {
        const MysqlModel = select_mysql_model(action);
        try{
            return await MysqlModel.destroy({
                where: condition, logging: false
            });
        } catch (e){
            if (e.code === 'ECONNREFUSED' || e.name === `SequelizeConnectionRefusedError`){
                throw new Error(`Нет доступа к базе данных.`);
            } else {
                console.error('can not delete', action, condition);
            }
        }   
    },

    MYSQL_SAVE: async ( action, keys, values) => {
        const MysqlModel = select_mysql_model(action);

        if ( keys && Object.keys(keys).length > 0 ){
            values = {...values, ...keys};
        }

        try {
            if (typeof values.length !== 'undefined' && values.length > 0){
                return await MysqlModel.bulkCreate(values, {logging: false, ignoreDuplicates: true})
            } else {
                return (await MysqlModel.upsert(values, { where: keys, logging: false, raw: true })).shift();
            }
        } catch (e){
            if (e.code === 'ECONNREFUSED' || e.name === `SequelizeConnectionRefusedError`){
                throw new Error(`Нет доступа к базе данных.`);
            } else {
                throw new Error(e);
            }
        }       
    },

}