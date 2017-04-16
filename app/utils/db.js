/**
 * User: kfs
 * Date：2017/4/2
 * Desc：数据库连接
 */
var mongoose = require('mongoose');
var logger  = require('./logger');
// 此处防止 node.js - Mongoose: mpromise 错误
mongoose.Promise = global.Promise;

module.exports = function(config){

    var connect = function() {
        //对于长时间运行的applictions的，它往往是谨慎启用KEEPALIVE。
        // 没有它，一段时间后，你可能会开始看没有理由的“connection closed”的错误。
        // 如果是这样的话，看这个后，你可能会决定启用KEEPALIVE
        var options = {
            server: {
                socketOptions: {
                    keepAlive: 1
                }
            }
        };
        mongoose.connect(config.db, options);
    };
    connect();

    var db = mongoose.connection;

    /**
     * 连接成功
     */
    db.on('connected', function () {
        logger.info('数据库连接成功: ' + config.db);
    });
    /**
     * 连接异常
     */
    db.on('error', function(err) {
        logger.info('数据库连接异常:: ' + err);
    });
    /**
     * 连接断开
     */
    db.on('disconnected', function() {
        logger.info('数据库连接断开了. 正在尝试重新连接.');
        connect();
    });
};

