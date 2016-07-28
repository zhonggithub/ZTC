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
let packageOfOperatorImp = {
};
let imp = {};

class ZResourceOperator{
    constructor(resourceDB, ResourceLogicInfo, ResourceDBInfo, ResourceUpdateDBInfo, convertQueryCriteria, convertCountCriteria){
        packageOfOperatorImp.resourceDB = resourceDB;
        packageOfOperatorImp.convertQueryCriteria = convertQueryCriteria;
        packageOfOperatorImp.convertCountCriteria = convertCountCriteria ? convertCountCriteria : convertQueryCriteria ;
        packageOfOperatorImp.ResourceLogicInfo = ResourceLogicInfo;
        packageOfOperatorImp.ResourceDBInfo = ResourceDBInfo;
        packageOfOperatorImp.ResourceUpdateDBInfo = ResourceUpdateDBInfo ? ResourceUpdateDBInfo : ResourceDBInfo;

        imp = new Proxy(packageOfOperatorImp, {
            get: function(target, property) {
                if (property in target) {
                    if(target[property] != undefined && target[property] != '')
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

    retrieveResource(id, callback){
        imp.resourceDB.retrieveResource({id: id}, function(error, result){
            if(error){
                callback(error);
                return;
            }
            callback(null, result ? new imp.ResourceLogicInfo(result) : result)
        });
    }

    deleteResource(id, callback){
        imp.resourceDB.deleteResource({id: id}, function(error, result){
            if(error){
                callback(error);
                return;
            }
            callback(null, result)
        });
    }

    logicDeleteResource(id, callback){
        imp.resourceDB.logicDeletePlace({id: id}, function(error, result){
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