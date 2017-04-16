'use strict';
/**
 * Created by xiangsongtao on 16/3/4.
 */
'use strict'
var ERROR  = require('../utils/errcode');
//MyInfo的数据模型
let Tags = require('../models').Tag;

module.exports = {
    get: function (req, res, next) {
        Tags.find({}, function (err, docs) {
            if (err) {
                res.retError({code: ERROR.SYSTEM_ERROR, msg: err.message});
                return next();
            }
            res.retJson(docs);
        })
    },
    getAllWithStructure: function (req, res, next) {
        Tags.find({}).sort('catalogue_name').exec(function (err, docs) {
            if (err) {
                res.retError({code: ERROR.SYSTEM_ERROR, msg: err.message});
                return next();
            }
            let tagsArr = [];
            let cataObj = {};

            let nowCata = '';
            for (let i = 0, docLen = docs.length; docLen > i; i++) {
                let tplCata = docs[i].catalogue_name.toString();
                if (nowCata !== tplCata) {
                    if(nowCata !== ''){
                        tagsArr.push(cataObj);
                    }

                    nowCata = tplCata;
                    cataObj = {
                        "name": nowCata,
                        "data": []
                    };
                    cataObj.data.push(docs[i]);
                    if (docLen == i + 1) {
                        tagsArr.push(cataObj);
                    }
                }else{
                    cataObj.data.push(docs[i]);
                    if (docLen == i + 1) {
                        tagsArr.push(cataObj);
                    }
                }
            }
            res.retJson(tagsArr);
        });
    },
    getById: function (req, res, next) {
        Tags.findOne({_id: req.params.id}, function (err, doc) {
            if (err) {
                res.retError({code: ERROR.SYSTEM_ERROR, msg: err.message});
                return next();
            }
            if (!!doc) {

                res.retJson(doc);
            } else {
                res.retError({code: ERROR.DATA_NOT_FOUND, msg: '该标签不存在'});
            }

        })
    },
    add: function (req, res, next) {
        Tags.findOne({name: req.body.name}, function (err, doc) {
            if (err) {
                res.retError({code: ERROR.SYSTEM_ERROR, msg: err.message});
                return next();
            }
            if (!!doc) {

                res.retError({code: ERROR.DATA_EXISTED, msg: '该标签已经存在'});
            } else {
                //新增标签
                let {name, catalogue_name} =  req.body;
                let tagData = {
                    name: name,
                    catalogue_name: catalogue_name,
                    used_num: 0,
                    create_time: new Date()

                };
                let tag = new Tags(tagData);
                tag.save();
                tagData._id = tag._id;
                res.retJson(tagData);
            }
        })
    },
    edit: function (req, res, next) {
        Tags.findOne({_id: req.body._id}, function (err, tag_orig) {
            if (err) {
                res.retError({code: ERROR.SYSTEM_ERROR, msg: err.message});
                return next();
            }
            if (!!tag_orig) {
                Tags.findOne({name: req.body.name}, function (err, doc) {
                    if (err) {
                        res.retError({code: ERROR.SYSTEM_ERROR, msg: err.message});
                        return next();
                    }
                    if (!!doc && (doc._id.toString() !== tag_orig._id.toString())) {

                        res.retError({code: ERROR.DATA_EXISTED, msg: '该标签已经存在'});
                    }else{
                        tag_orig.name = req.body.name;
                        tag_orig.catalogue_name = req.body.catalogue_name;
                        tag_orig.save();
                        res.retJson(tag_orig)
                    }
                })

            } else {

                res.retError({code: ERROR.SYSTEM_ERROR, msg: '标签不存在或参数错误'})
            }
        })
    },
    delete: function (req, res, next) {
        Tags.remove({_id: req.params.id}, function (err) {
            if (err) {
                res.retError({code: ERROR.SYSTEM_ERROR, msg: err.message});
                return next();
            }

            res.retSuccess({
                "code": 0,
                "msg": `tag ${req.params.id} delete success!`
            });
        });
    },
    getUsedTop:function (req, res, next) {
        Tags.find({},{'name':1,'used_num':1}).sort('-used_num').limit(parseInt(req.params.topNum)).exec(function (err, docs) {
            if (err) {
                res.retError({code: ERROR.SYSTEM_ERROR, msg: err.message});
                return next();
            }

            res.retJson(docs);
        })
    },
};






