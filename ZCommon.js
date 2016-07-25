/**
 * ProjectName: zcmex
 * FileName: ZCommon.js
 * Version: 0.0.1
 * Author: Zz
 * CreatedAt: 2016/7/19
 * Description:
 */
'use strict';
const errorCodeTable = require('./errorCodeTable');
const crypto = require('crypto');
const uuid = require('node-uuid');
var util = require('util');
var assert = require('assert');
var config = require('./config');
var log = require('./log');

class Common{
    constructor(consoleDebug){
        this.retContentType = "application/json;charset=UTF-8";
        this.defaultOffet = 0;
        this.defaultLimit = 25;
        this.consoleDebug = consoleDebug ? consoleDebug : true;
    }

    isJson(obj){
        var isjson = typeof(obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length;
        return isjson;
    }

    getUUIDInHref(href, reg, lastReg) {
        let serviceReg = new RegExp(reg);
        let serviceResult = serviceReg.exec(href);
        let subStr = href.substr(serviceResult['index'] + serviceResult[0].length);
        if (!lastReg)
            return subStr;
        serviceReg = new RegExp(lastReg);
        serviceResult = serviceReg.exec(subStr);
        return subStr.substr(0, serviceResult['index']);
    }

    generateUUID() {
        let p;
        do {
            let md5 = crypto.createHash('md5');
            p = md5.update(uuid.v1()).digest('base64');
        } while (p.indexOf('/') != -1 || p.indexOf('+') != -1);
        return p.substr(0, p.length - 2);
    }

    ifReturnTrue(value) {
        return value ? true : false;
    }

    ifReturnStr(value, str) {
        return value ? (util.isString(value) ? value : string(value)) : (str ? str : '');
    }

    ifReturnNum(value, num) {
        return value ? Number(value) : (num ? num : 0);
    }

    ifReturnJson(value, json) {
        return value ? (this.isJson(value) ? value : JSON.stringify(value)) : (json ? json : {});
    }

    koaErrorReturn(res, status, error) {
        res.status = status ? status : 500;
        res.type = this.retContentType;

        let body = {
            'name': ((error && error.name) ? error.name : 'Error'),
            'code': ((error && error.code) ? error.code : 9999),
            'message': ((error && error.message) ? error.message : 'Unknown Error'),
            'description': ((error && error.description) ? error.description : ''),
            'stack': ((error && error.stack) ? error.stack : '')
        };
        res.body = JSON.stringify(body);

        let logString = 'status: ' + status + ' name: ' + body.name + ' code: '
            + body.code + ' message: ' + body.message + ' description: ' + body.description;
        this.consoleLog(logString);
        log.getInstance().logger().error(error?error:body);
    }

    expressErrorReturn(res, status, error) {
        res.writeHead(status, {'Content-Type': this.retContentType});
        let body = {
            'name': ((error && error.name) ? error.name : 'Error'),
            'code': ((error && error.code) ? error.code : 9999),
            'message': ((error && error.message) ? error.message : 'Unknown Error'),
            'description': ((error && error.description) ? error.description : ''),
            'stack': ((error && error.stack) ? error.stack : '')
        };
        res.write(JSON.stringify(body));
        res.end();
        let logString = 'status: ' + status + ' name: ' + body.name + ' code: '
            + body.code + ' message: ' + body.message + ' description: ' + body.description;
        this.consoleLog(logString);
        log.getInstance().logger().error(error?error:body);
    }

    filterData(dataInfo, excludeAttribute) {
        let retDataInfo = {};
        for (let item in dataInfo) {
            var isContinue = false;
            for (let i = 0; i < excludeAttribute.length; ++i) {
                if (item == excludeAttribute[i]) {
                    isContinue = true;
                    break;
                }
            }
            if (isContinue)
                continue;

            retDataInfo[item] = dataInfo[item];
        }
        return retDataInfo;
    }

    isHasExpandAttribute (queryConditions) {
        if(!queryConditions)
            return false;
        for(let item in queryConditions)
        {
            if(item ==  'expand')
                return true;
        }
        return false;
    }

    /**
     *  检查必选参数
     * @param verificationInfo [JSON] 参数集
     * @param mandParams [Array] 必选参数
     * @returns error Error错误对象
     */
    mandatoryParams(verificationInfo, mandParams) {
        let error = null;
        mandParams.some(function (item) {
            if (!verificationInfo.hasOwnProperty(item)) {
                error = new Error();
                error.name = 'Error';
                error.status = 400;
                error.code = errorCodeTable.missingParam2Code(item);
                error.message = errorCodeTable.errorCode2Text(error.code);
                error.description = 'Can\'t find the ' + item + ' field.';
                return true;
            }
        });
        return error;
    }

    /**
     *  参数有效性判断
     * @param verificationInfo [JSON] 参数集
     * @param valParamsJudgeFunction [JSON] 参数有效性判断函数集，JOSN的key值对应verificationInfo里面的key值，value值为有效性判断函数
     * @returns error Error错误对象
     */
    validateParams(verificationCodesInfo, valParamsJudgeFunction) {
        let error = null;
        for (let item in valParamsJudgeFunction) {
            if (verificationCodesInfo.hasOwnProperty(item)) {
                if (!valParamsJudgeFunction[item](verificationCodesInfo[item])) {
                    error = new Error();
                    error.name = 'SyntaxError';
                    error.status = 400;
                    error.code = errorCodeTable.formatParam2Code(item);
                    error.message = errorCodeTable.errorCode2Text(error.code);
                    error.description = 'Request ' + item + ' field.';
                    return error;
                }
            }
        }
        return error;
    }

    isValidQueryParams(queryConditions, isValidQueryCondition, isExpandStrValid) {
        let retData = {'is': true, 'error': '', 'flag': 0, 'isExpand': false};

        let error = new Error();
        error.name = 'SyntaxError';
        error.status = 400;
        error.code = 3999;
        error.message = errorCodeTable.errorCode2Text(error.code);
        if (isValidQueryCondition && !isValidQueryCondition(queryConditions)) {
            error.description = 'query params error! the query string is : ' + querystring.stringify(queryConditions);
            retData.is = false;
            retData.error = error;
            return retData;
        }

        if (!isExpandStrValid)
            return retData;

        let isExpand = this.isHasExpandAttribute(queryConditions);
        retData.isExpand = isExpand;
        if (isExpand && isExpandStrValid(queryConditions.expand) == false) {
            error.description = 'query params of expand is error! expand string is: ' + queryConditions.expand;
            retData.is = false;
            retData.error = error;
            return retData;
        }
        return retData;
    }

    getExpand(expandStr) {
        let reg = /[(:,)]/;
        let strArray = expandStr.split(reg);
        let offset, limit, key;
        key = strArray[0];
        if (strArray.length > 5 && strArray[1] === 'offset' && strArray[3] === 'limit') {
            offset = Number(strArray[2]);
            limit = Number(strArray[4]);
        } else if (strArray.length > 5 && strArray[3] === 'offset' && strArray[1] === 'limit') {
            offset = Number(strArray[4]);
            limit = Number(strArray[2]);

        } else {
            key = expandStr;
        }
        return [key, offset, limit];
    }

    isOnly(error, results) {
        let retData = {'is': true, 'error': '', 'flag': 0};
        if (error) {
            retData.error = error;
            retData.is = false;
            retData.flag = 3;
            return retData;
        }
        if (results.length == 0) {
            let error = new Error();
            error.name = 'SyntaxError';
            error.status = 404;
            error.code = 7038;
            error.message = errorCodeTable.errorCode2Text(error.code);
            error.description = 'Could not find the resource.';

            retData.error = error;
            retData.is = false;
            retData.flag = 1;
            return retData;
        }
        else if (results.length > 1) {
            let error = new Error();
            error.name = 'InternalError';
            error.status = 409;
            error.code = 7037;
            error.message = errorCodeTable.errorCode2Text(error.code);
            error.description = 'Find much resource.';

            retData.error = error;
            retData.is = false;
            retData.flag = 2;
            return retData;
        }
        return retData;
    }

    dbError(error) {
        if (!error) {
            var describe = arguments[1] ? arguments[1] : 'server instruction execution fail.';
            var status = arguments[0] ? arguments[0] : 507;
            var error = new Error(describe);
            error.status = status;
            return error;
        }

        assert(util.isError(error));
        if (error.code && error.errno) {
            var err = new Error();
            err.name = 'DBError';
            err.status = 500;
            err.code = 5100;
            err.message = errorCodeTable.errorCode2Text(err.code);
            err.description = error.code + '( ' + error.errno + ' ): ' + error.message;
            return err;
        }
        else {
            error.name = 'DBError';
            error.description = '';
            error.status = 500;
            error.code = 5100;
            error.message = errorCodeTable.errorCode2Text(error.code);
            return error;
        }
    }

    error404(){
        let error = new Error();
        error.name = 'InternalError';
        error.status = 404;
        error.code = 7038;
        error.message = errorCodeTable.errorCode2Text(error.code);
        error.description = 'Could not find the resource.';
        return error;
    }

    error409(){
        let error = new Error();
        error.name = 'InternalError';
        error.status = 409;
        error.code = 7037;
        error.message = errorCodeTable.errorCode2Text(error.code);
        error.description = 'the resource is exist.';
        return error;
    }

    retEmptyAttribute(value){
        assert(this.isJson(value));
        let retInfo = new Array();
        for(let item in value){
            if(!value[item])
                retInfo.push(item);
        }
        return retInfo;
    }

    convertQueryCriteria(criteria, isDefault){
        let dbCriteria = {where:{}};

        let filterAttributeArray = [];
        for(let condition in criteria){
            switch(condition){
                case "limit":
                    dbCriteria[condition] = this.ifReturnNum(criteria[condition], this.defaultLimit);
                    filterAttributeArray.push(condition);
                    break;
                case "offset":
                    dbCriteria.skip = this.ifReturnNum(criteria[condition], this.defaultOffet);
                    filterAttributeArray.push(condition);
                    break;
                case "orderBy":{
                    dbCriteria.sort = {};
                    let array = criteria[condition].split(',');
                    for(let i = 0; i < array.length; ++i){
                        let tmpArray = array[i].split(' ');
                        if(tmpArray.length != 2)
                            dbCriteria.sort[tmpArray[0] ] = 'asc';
                        else if(tmpArray.length == 2)
                            dbCriteria.sort[tmpArray[0] ] = tmpArray[1];
                    }
                    filterAttributeArray.push(condition);
                }break;
                case "createdAt":
                case "modifiedAt":
                {
                    dbCriteria['where'][condition] = {};
                    let beginStr = criteria[condition][0];
                    let endStr = criteria[condition][criteria[condition].length - 1];
                    if (beginStr === "[" || beginStr === "(" || beginStr === "{") {
                        let array = criteria[condition];
                        array = array.replace(/(\[)|(\])|(\()|(\))|(\{)|(\})|(\")/g, "");
                        array = array.split(',');
                        if (beginStr === '[' && endStr === ']') { //数组字符串
                            if (array[0] != ' ' && array[0] != '') {
                                dbCriteria['where'][condition]['>='] = new Date(array[0]);
                            }
                            if (array[1] != ' ' && array[1] != '') {
                                dbCriteria['where'][condition]['<='] = new Date(array[1]);
                            }
                        } else if (beginStr === '(' && endStr === ']') {
                            if (array[0] != ' ' && array[0] != '') {
                                dbCriteria['where'][condition]['>'] = new Date(array[0]);
                            }
                            if (array[1] != ' ' && array[1] != '') {
                                dbCriteria['where'][condition]['<='] = new Date(array[1]);
                            }
                        } else if (beginStr === '[' && endStr === ')') {
                            if (array[0] != ' ' && array[0] != '') {
                                dbCriteria['where'][condition]['>='] = new Date(array[0]);
                            }
                            if (array[1] != ' ' && array[1] != '') {
                                dbCriteria['where'][condition]['<'] = new Date(array[1]);
                            }
                        } else if (beginStr === '(' && endStr === ')') {
                            if (array[0] != ' ' && array[0] != '') {
                                dbCriteria['where'][condition]['>'] = new Date(array[0]);
                            }
                            if (array[1] != ' ' && array[1] != '') {
                                dbCriteria['where'][condition]['<'] = new Date(array[1]);
                            }
                        } else if (beginStr === '{' && endStr === '}') {
                            dbCriteria['where'][condition] = array;
                        }
                    } else {
                        dbCriteria['where'][condition] = criteria[condition];
                    }

                    filterAttributeArray.push(condition);
                }break;
                case "expand":
                    break;
                case "name":{
                    if (criteria[condition].indexOf('*') == -1)
                        dbCriteria['where'][condition] = criteria[condition];
                    else {
                        let reg = /\*/g;
                        let str = criteria[condition].replace(reg, '%');
                        dbCriteria['where'][condition] = {'like': str};
                    }
                    filterAttributeArray.push(condition);
                    break;
                }break;
                default:
                    if(isDefault){
                        dbCriteria['where'][condition] = criteria[condition];
                        filterAttributeArray.push(condition);
                    }
                    break;
            }
        }

        filterAttributeArray.forEach(function(item){
            if(criteria.hasOwnProperty(item)){
                delete criteria[item];
            }
        });

        return dbCriteria;
    }

    convertCountCriteria(criteria, isDefault){
        let dbCriteria = {where:{}};

        for(let condition in criteria){
            switch(condition){
                case "limit":
                case "offset":
                case "orderBy":
                case "createdAt":
                case "modifiedAt":
                case "expand":
                {
                    dbCriteria['where'][condition] = {};
                    let beginStr = criteria[condition][0];
                    let endStr = criteria[condition][criteria[condition].length - 1];
                    if (beginStr === "[" || beginStr === "(" || beginStr === "{") {
                        let array = criteria[condition];
                        array = array.replace(/(\[)|(\])|(\()|(\))|(\{)|(\})|(\")/g, "");
                        array = array.split(',');
                        if (beginStr === '[' && endStr === ']') { //数组字符串
                            if (array[0] != ' ' && array[0] != '') {
                                dbCriteria['where'][condition]['>='] = new Date(array[0]);
                            }
                            if (array[1] != ' ' && array[1] != '') {
                                dbCriteria['where'][condition]['<='] = new Date(array[1]);
                            }
                        } else if (beginStr === '(' && endStr === ']') {
                            if (array[0] != ' ' && array[0] != '') {
                                dbCriteria['where'][condition]['>'] = new Date(array[0]);
                            }
                            if (array[1] != ' ' && array[1] != '') {
                                dbCriteria['where'][condition]['<='] = new Date(array[1]);
                            }
                        } else if (beginStr === '[' && endStr === ')') {
                            if (array[0] != ' ' && array[0] != '') {
                                dbCriteria['where'][condition]['>='] = new Date(array[0]);
                            }
                            if (array[1] != ' ' && array[1] != '') {
                                dbCriteria['where'][condition]['<'] = new Date(array[1]);
                            }
                        } else if (beginStr === '(' && endStr === ')') {
                            if (array[0] != ' ' && array[0] != '') {
                                dbCriteria['where'][condition]['>'] = new Date(array[0]);
                            }
                            if (array[1] != ' ' && array[1] != '') {
                                dbCriteria['where'][condition]['<'] = new Date(array[1]);
                            }
                        } else if (beginStr === '{' && endStr === '}') {
                            dbCriteria['where'][condition] = array;
                        }
                    } else {
                        dbCriteria['where'][condition] = criteria[condition];
                    }
                }break;
                case "account":
                case "name":{
                    if (criteria[condition].indexOf('*') == -1)
                        dbCriteria['where'][condition] = criteria[condition];
                    else {
                        let reg = /\*/g;
                        let str = criteria[condition].replace(reg, '%');
                        dbCriteria['where'][condition] = {'like': str};
                    }
                    break;
                }break;
                default:
                    if(isDefault)
                        dbCriteria['where'][condition] = criteria[condition];
                    break;
            }
        }

        return dbCriteria;
    }

    // ---- * package Response Of Create Success
    packageResOfCS(res, body){
        res.status = 201;
        res.type = this.retContentType;
        res.body = JSON.stringify(body);
    }

    // ---- * package Response Of Retrieve Success
    packageResOfRS(res, body){
        res.status = 200;
        res.type = this.retContentType;
        res.body = JSON.stringify(body);
    }

    // ---- * package Response Of Update Success
    packageResOfUS(res, body){
        res.status = 200;
        res.type = this.retContentType;
        res.body = JSON.stringify(body);
    }

    // ---- * package Response Of Delete Success
    packageResOfDS(res){
        res.status = 204;
    }

    consoleLog(obj){
        if(this.consoleDebug)
            console.log(obj);
    }

    retListData(query, data, size, retFunction, href){
        let retData = {
            offset: this.ifReturnNum(query.offset, this.defaultOffet),
            limit: this.ifReturnNum(query.limit, this.defaultLimit),
            size: size,
            items: new Array()
        };
        data.forEach(function(item){
            retData.items.push(retFunction(item));
        });
        if(href){
            retData.href = href;
        }
        return retData;
    }
}
module.exports = Common;