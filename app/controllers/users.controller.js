/**
 * Created by xiangsongtao on 16/3/3.
 */
'use strict'
let mongoose = require('mongoose');
let $base64 = require('../utils/base64.utils.js');
let md5 = require('js-md5');
let fs = require('fs');
let qiniu = require('../utils/qiniu');
//MyInfo的数据模型
let Users = require('../models').User;
let getClientIp = require('../utils/getClientIp.utils.js');
var ERROR  = require('../utils/errcode');
let marked = require('marked');

module.exports = {

    /**
	 * 更新密码
     * @param req
     * @param res
     * @param next
     */
	changePassword: function (req, res, next) {
		let {_id, username, password, new_password} = req.body;

		Users.findOne({_id: _id}, function (err, user) {
			if (err) {
                res.retError({code: ERROR.SYSTEM_ERROR, msg: err.message});
				return next();
			}
			//有用户数据且密码正确
			if (!!user) {
				if (user.password === password) {
					user.username = username;
					user.password = new_password;
					user.save();
					res.retSuccess({code: 0, msg: '密码修改成功'});
					// res.redirect('/#/login');
				} else {
					res.retError({code: ERROR.PARAM_ERROR, msg: '输入密码不正确'});
				}

			} else {
				res.retError({code: ERROR.DATA_NOT_FOUND, msg: '该用户不存在,请检查'});
			}
		});
	},
    /**
	 * 获取所有用户
     * @param req
     * @param res
     * @param next
     */
	getAll: function (req, res, next) {
		Users.find({}, {'username': 0, 'password': 0, 'is_admin': 0, 'login_info': 0, '__v': 0}, function (err, users) {
			if (err) {
                res.retError({code: ERROR.SYSTEM_ERROR, msg: err.message});
				return next();
			}
			ret.retJson(users);
		})
	},
    /**
	 * 通过id获取用户信息
     * @param req
     * @param res
     * @param next
     */
	getById: function (req, res, next) {
		Users.findOne({_id: req.params.id}, {
			'_id': 0,
			'username': 0,
			'password': 0,
			'is_admin': 0,
			'login_info': 0,
			'__v': 0
		}, function (err, user) {
			if (err) {
                res.retError({code: ERROR.SYSTEM_ERROR, msg: err.message});
				return next();
			}
			//将我的介绍由markdown转化为html输出
			// marked
			/**
			 * markdown转html
			 **/
			marked.setOptions({
				renderer: new marked.Renderer(),
				gfm: true,
				tables: true,
				breaks: true,
				pedantic: false,
				sanitize: false,
				smartLists: true,
				smartypants: false,
			});
			//user.personal_state = marked(user.personal_state);

			if (!!user) {
				res.retJson(user);
			} else {
				res.retError({code: ERROR.DATA_NOT_FOUND, msg: '该用户不存在'});
			}

		})
	},
	//原始的个人信息,可以二次修改
	getByIdWithOriginal: function (req, res, next) {
		Users.findOne({_id: req.params.id},{
			'username': 0,
			'password': 0,
		}, function (err, user) {
			if (err) {
                res.retError({code: ERROR.SYSTEM_ERROR, msg: err.message});
				return next();
			}

			if (!!user) {
				res.retJson(user);
			} else {
				res.status(200);
                res.retError({code: ERROR.DATA_NOT_FOUND, msg: '该用户不存在'});
			}

		})
	},
	edit: function (req, res, next) {
		Users.findOne({_id: req.body._id}, function (err, user) {
			if (err) {
                res.retError({code: ERROR.SYSTEM_ERROR, msg: err.message});
				return next();
			}
			//如果没有数据,则增加
			if (!user) {
				//发送
                res.retError({code: ERROR.DATA_NOT_FOUND, msg: '该用户不存在'});
			} else {
				({
					full_name: user.full_name,
					position: user.position,
					address: user.address,
					motto: user.motto,
					personal_state: user.personal_state,
					img_url: user.img_url
				} = req.body);
				if (req.body.is_admin !== undefined) {
					user.is_admin = req.body.is_admin
				}
				user.save();
				res.retSuccess({code: 0, msg: '更新用户信息成功'});
			}
		});


	},
	delete: function (req, res, next) {
		Users.remove({_id: req.params.id}, function (err) {
			if (err) {
                res.retError({code: ERROR.SYSTEM_ERROR, msg: err.message});
				return next();
			}
			res.retSuccess({code: 0, msg: `用户 ${req.params.id} 删除成功!`});
		});
	},
    /**
     * 头像上传
     * @param req
     * @param res
     * @param next
     */
    uploadAvatar: function(req, res, next){

        if (req.files) {

            const UploadFilePath = './uploads/';
            let imgInfo = req.files.uploadImg;
            let arr = imgInfo.type.split('/');
            let suffix = arr[arr.length - 1];
            //新建文件名
            let fileName = `${Date.parse(new Date())}.${suffix}`;
            let uploadPath = `${UploadFilePath}${fileName}`;

            qiniu.client.uploadFile(imgInfo.path, {key: fileName}, function (err, result) {
                if (err) {
                    next(err)
                }
                res.retJson({
					imgUrl: result.url
				});
            });
        } else {
            res.retError({code: ERROR.DATA_NOT_FOUND, msg: '上传失败，至少上传一个文件'})
        }
    }
};






