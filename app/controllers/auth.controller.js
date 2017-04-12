/**
 * User: kfs
 * Date：2017/4/2
 * Desc：认证控制器
 */
var crypto = require('crypto');
var validator      = require('validator');
var jwt = require('jsonwebtoken');
var User = require('../models').User;
var env = process.env.NODE_ENV || 'development';
var config = require('../config/config')[env];
var logger  = require('../utils/logger');
var ERROR  = require('../utils/errcode');
var mail = require('../utils/mail');

function genLoginToken(user) {
    _user = {
        _id: user._id,
        email: user.email
    };

    var token = jwt.sign(user, config.sessionSecret, {
        expiresIn: 60 * 24 * 30
    });

    return token;
}

/**
 * 用户登录
 * @param req
 * @param res
 * @returns {*}
 */
exports.signin = function(req, res) {
    var email = req.body.email;
    var password = req.body.password;

    // 验证信息的正确性
    if ([email, password].some(function (item) { return item === ''; })) {
        return res.retError({code: ERROR.PARAM_ERROR, msg: '信息不完整'});
    }

    if (!validator.isEmail(email)) {
        return res.retError({code: ERROR.PARAM_ERROR, msg: '邮箱不合法'});
    }

    User
        .findOne({
            email: email
        })
        .exec(function(err, user) {
            if (!user) {
                return res.retError({code: ERROR.DATA_NOT_FOUND, msg: '用户不存在'});
            }

            if (user.auth(password)) {
                user = user.toObject();
                delete user.passwordHash;
                user.token = genLoginToken(user);
                return res.retJson(user);
            } else {
                return res.retError({code: ERROR.LOGIN_REQUIRED, msg: '用户名或密码错误'});
            }
        });
};

/**
 * 用户注册
 * @param req
 * @param res
 * @returns {*}
 */
exports.signup = function(req, res) {
    var email = req.body.email;
    var password = req.body.password;

    // 验证信息的正确性
    if ([email, password].some(function (item) { return item === ''; })) {

        return res.retError({code: ERROR.PARAM_ERROR, msg: '信息不完整'});
    }

    if (!validator.isEmail(email)) {

        return res.retError({code: ERROR.PARAM_ERROR, msg: '邮箱不合法'});
    }

    User
        .findOne({
            email: email
        })
        .exec(function(err, user) {
            if (user) {

                return res.retError({code: ERROR.DATA_EXISTED, msg: '该用户已存在'});
            }

            user = new User({
                email: email,
                password: password
            });

            user.save(function(err, user) {

                mail.sendActiveMail(email, user._id);
                user = user.toObject();
                delete user.passwordHash;
                var token = genLoginToken(user);

                return res.retJson({
                    user: user,
                    token: token
                });
            });
        });
};

/**
 * 用户激活
 * @param req
 * @param res
 * @returns {*}
 */
exports.activeAccount = function(req, res) {
    var userId = req.params.userId;
    var token = req.query.confirm_token;
    var md5 = crypto.createHash('md5');
    var testToken = md5.update(config.sessionSecret + userId).digest('hex');
    if (token === testToken) {

        User
            .findById(userId)
            .exec(function(err, user) {

                if (user.activated === true) {

                    user = user.toObject();
                    delete user.passwordHash;
                    var token = genLoginToken(user);

                    return res.retJson({
                        user: user,
                        token: token
                    });
                }

                user.activated = true;
                user.save(function(err, user) {

                    user = user.toObject();
                    delete user.passwordHash;
                    user.token = genLoginToken(user);
                    return res.retJson(user);

                });
            });

    } else {

        return res.retError({code: ERROR.DATA_INVALID, msg: '帐号验证失败'});
    }
};

