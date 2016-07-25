/**
 * Copyright(C),
 * FileName:  log.js
 * Author: Zz
 * Version: 1.0.0
 * Date: 2015/10/13  15:30
 * Description:
 */
'use strict';
var log4js = require('log4js');
var fs = require("fs");
var path = require("path");
var logConfig = require('../config/log4js');

// 加载配置文件
var objConfig = {
    "appenders": [
        {"type": "console", "category": "console"},
        {"type": "file", "filename": path.join(path.dirname(__dirname) + '/log/', logConfig.name), "category": logConfig.name}
    ],
    "replaceConsole": true,
    "levels": logConfig.levels
};

module.exports = (function () {
    class LogImp{
        constructor(config){
            this.config = config ? config : objConfig;
            // 检查配置文件所需的目录是否存在，不存在时创建
            this.checkAndCreateDir(path.dirname(__dirname) + '/log/');
            // 目录创建完毕，才加载配置，不然会出异常
            log4js.configure(objConfig);
        }
        checkAndCreateDir(dir){ // 判断日志目录是否存在，不存在时创建日志目录
            if(fs.existsSync(dir)){
                return true;
            }else{
                if(this.checkAndCreateDir(path.dirname(dir))){
                    fs.mkdirSync(dir);
                    return true;
                }
            }
        }

        logger(){
            return log4js.getLogger(logConfig.name);
        }
    }

    var instantiated;
    function init() {
        return new LogImp();
    }

    return {
        getInstance: function () {
            if (!instantiated) {
                instantiated = init();
            }
            return instantiated;
        }
    };
})();