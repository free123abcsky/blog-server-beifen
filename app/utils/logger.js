/**
 * User: kfs
 * Date：2016/11/5
 * Desc：日志管理
 */
var log4js = require('log4js');
var env = process.env.NODE_ENV || 'development';
var config = require('../config/config')[env];

log4js.configure({
    appenders: [
        { type: 'console' }, //控制台输出
        {
            type: 'DateFile', //文件输出
            filename: './logs/access.log',
            pattern: "_yyyy-MM-dd.log",
            alwaysIncludePattern: true,
            maxLogSize: 1024,
            backups:3,
            category: 'log'
        },
    ],
    replaceConsole: true
});
var logger = log4js.getLogger('log');
logger.setLevel(env == 'development' ? 'DEBUG' : 'ERROR');

module.exports = logger;
