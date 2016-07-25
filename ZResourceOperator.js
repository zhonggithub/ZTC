/**
 * ProjectName: zcmex
 * FileName: ZResourceOperator.js
 * Version: 0.0.1
 * Author: Zz
 * CreatedAt: 2016/7/22
 * Description:
 */
'use strict';

const ZCommon = require('./ZCommon');
const common = new ZCommon();
let packageOfOperatorImp = {
};
let imp = {};

class ZResourceOperator{
    constructor(resourceDB, ResourceLogicInfo, ResourceDBInfo, convertQueryCriteria, convertCountCriteria){
        packageOfOperatorImp.resourceDB = resourceDB;
        packageOfOperatorImp.convertQueryCriteria = convertQueryCriteria;
        packageOfOperatorImp.convertCountCriteria = convertCountCriteria ? convertCountCriteria : convertQueryCriteria ;
        packageOfOperatorImp.ResourceLogicInfo = ResourceLogicInfo;
        packageOfOperatorImp.ResourceDBInfo = ResourceDBInfo;

        imp = new Proxy(packageOfOperatorImp, {
            get: function(target, property) {
                if (property in target) {
                    if(!target[property])
                        return function(data){return data};
                    else
                        return target[property];
                } else {
                    throw new ReferenceError("Property \"" + property + "\" does not exist.");
                }
            }
        });
    }

    createResource(logicInfo, callback) {
        let dbInfo = new imp.ResourceDBInfo(logicInfo, true);
        imp.resourceDB.createResource(dbInfo, function (error, result) {
            if (error) {
                callback(error);
                return;
            }
            callback(null, new imp.ResourceLogicInfo(result));
        });
    }

    updateResource(logicInfo, callback){
        let dbInfo = new imp.ResourceDBInfo(logicInfo);
        imp.resourceDB.updateResource(dbInfo, function (error, result) {
            if (error) {
                callback(error);
                return;
            }
            let infoArray = new Array();
            result.forEach(function (element) {
                infoArray.push(new imp.ResourceLogicInfo(element))
            });
            callback(null, infoArray);
        });
    }

    retrieveResource(uuid, callback){
        imp.resourceDB.retrieveResource({uuid: uuid}, function(error, result){
            if(error){
                callback(error);
                return;
            }
            callback(null, result ? new imp.ResourceLogicInfo(result) : result)
        });
    }

    deleteResource(uuid, callback){
        imp.resourceDB.deleteResource({uuid: uuid}, function(error, result){
            if(error){
                callback(error);
                return;
            }
            callback(null, result)
        });
    }

    logicDeleteResource(uuid, callback){
        imp.resourceDB.logicDeletePlace({uuid: uuid}, function(error, result){
            if(error){
                callback(error);
                return;
            }
            callback(null, result)
        });
    }

    findResource(criteria, callback) {
        let dbCriteria = imp.convertQueryCriteria(criteria);
        imp.resourceDB.findResource(dbCriteria, function (error, result) {
            if (error) {
                callback(error);
                return;
            }
            let infoArray = new Array();
            result.forEach(function (element) {
                infoArray.push(new imp.ResourceLogicInfo(element))
            });
            callback(null, infoArray);
        });
    }
    count(criteria, callback){
        let dbCriteria = imp.convertCountCriteria(criteria);
        imp.resourceDB.count(dbCriteria, function(error, size){
            callback(error, size);
        });
    }
}
module.exports = ZResourceOperator;