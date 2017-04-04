/**
 * User: kfs
 * Date：2016/11/5
 * Desc：邮箱公用方法
 */
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var env = process.env.NODE_ENV || 'development';
var config = require('../config/config')[env];
var logger  = require('./logger');
//var mailtpl = require('../config/mailtpl');
var transporter = nodemailer.createTransport(config.mail_opts);

/**
 * 生成token
 * @param userId
 */
var genToken = function(userId) {
    var md5 = crypto.createHash('md5');
    return md5.update(config.sessionSecret + userId).digest('hex');
}

/**
 * Send an email
 * @param {Object} data 邮件对象
 */
var sendMail = function (data) {
    if (config.debug) {
        return;
    }
    // 遍历邮件数组，发送每一封邮件，如果有发送失败的，就再压入数组，同时触发mailEvent事件
    transporter.sendMail(data, function (err) {
        if (err) {
            // 写为日志
            logger.error(err);
        }
    });
};

/**
 * 发送激活通知邮件
 * @param toEmail
 * @param userId
 */
exports.sendActiveMail = function (toEmail, userId) {

    var token = genToken(userId);
    var from    = config.mail_opts.auth.user
    var to      = toEmail;
    var subject = config.name + '社区帐号激活';
    var html    = '<p>您好：</p>' +
        '<p>我们收到您在' + config.name + '社区的注册信息，请点击下面的链接来激活帐户：</p>' +
        '<a href  = "' + config.web  + '/users/' + userId + '/verify?confirm_token=' + token + '">激活链接</a>' +
        '<p>若您没有在' + config.name + '社区填写过注册信息，说明有人滥用了您的电子邮箱，请删除此邮件，我们对给您造成的打扰感到抱歉。</p>' +
        '<p>' + config.name + '社区 谨上。</p>';

    sendMail({
        from: from,                   // 发送者
        to: to,                       // 接受者,可以同时发送多个,以逗号隔开
        subject: subject,             // 标题
        html: html                    // html代码
    });
};



