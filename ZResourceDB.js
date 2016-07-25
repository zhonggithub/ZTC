/**
 * ProjectName: zcmex
 * FileName: ZResourceDB.js
 * Version: 0.0.1
 * Author: Zz
 * CreatedAt: 2016/7/22
 * Description:
 */
const log = require('./log');
const ZCommon = require('./ZCommon');
const common = new ZCommon();

let packageOfResourceDBImp = {};

class ZResourceDB{
    constructor(getModuleFun){
        packageOfResourceDBImp.getModule = getModuleFun;
    }

    createResource(dbInfo, callback) {
        packageOfResourceDBImp.getModule().create(dbInfo, function (err, model) {
            if (err) {
                log.getInstance().logger().error(err);
                callback(common.dbError(err));
                return;
            }
            callback(null, model);
        });
    }

    updateResource(criteria, dbInfo, callback) {
        packageOfResourceDBImp.getModule().update(criteria, dbInfo, function (err, model) {
            if (err) {
                log.getInstance().logger().error(err);
                callback(common.dbError(err));
                return;
            }
            callback(null, model);
        });
    }

    resetStatus(criteria, dbInfo, callback){
        packageOfResourceDBImp.getModule().update(criteria, dbInfo, function (err, model) {
            if (err) {
                log.getInstance().logger().error(err);
                callback(common.dbError(err));
                return;
            }
            callback(null, model);
        });
    }

    retrieveResource(criteria, callback) {
        packageOfResourceDBImp.getModule().findOne(criteria, function (err, model) {
            if (err) {
                log.getInstance().logger().error(err);
                callback(common.dbError(err));
                return;
            }
            callback(null, model);
        });
    }

    deleteResource(criteria, callback) {
        packageOfResourceDBImp.getModule().destroy(criteria, function (err) {
            if (err) {
                log.getInstance().logger().error(err);
                callback(common.dbError(err));
                return;
            }
            callback(null, true);
        });
    }

    logicDeleteResource(criteria, callback){
        packageOfResourceDBImp.getModule().update(criteria, {status: 0}, function (err, model) {
            if (err) {
                log.getInstance().logger().error(err);
                callback(common.dbError(err));
                return;
            }
            callback(null, model);
        });
    }

    queryResource(queryStr, callback) {
        packageOfResourceDBImp.getModule().query(queryStr, function (err, model) {
            if (err) {
                log.getInstance().logger().error(err);
                callback(common.dbError(err));
                return;
            }
            callback(null, model);
        });
    }

    findResource(criteria, callback){
        packageOfResourceDBImp.getModule().find(criteria, function(err, model){
            if(err) {
                callback(common.dbError(err));
                log.getInstance().logger().error(err);
                return;
            }
            callback(null, model);
        });
    }

    count(criteria, callback){
        packageOfResourceDBImp.getModule().count(criteria, function(err, model){
            if(err){
                callback(common.dbError(err));
                log.getInstance().logger().error(err);
                return;
            }
            callback(null, model);
        });
    }
}
module.exports = ZResourceDB;