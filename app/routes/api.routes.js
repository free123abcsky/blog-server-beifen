'use strict';
let express = require('express');
let router = express.Router();

let multipart = require('connect-multiparty');
let multipartMiddleware = multipart();
var expressJwt = require('express-jwt');
var env = process.env.NODE_ENV || 'development';
var config = require('../config/config')[env];
var qiniu = require('../utils/qiniu');
var jwtOptions = {
    secret: config.sessionSecret
};

//控制器
var authController = require('../controllers/auth.controller.js');
let UsersController = require('../controllers/users.controller.js');
let TagsController = require('../controllers/tags.controller.js');
let ArticleController = require('../controllers/article.controller.js');
let CommentController = require('../controllers/comments.controller.js');
let StatisticController = require('../controllers/statistic.controller.js');

//User auth相关
router.post( '/signin', authController.signin);  //用户登录
router.post('/signup', authController.signup); //用户注册
router.get('/users/:userId/verify', authController.activeAccount);  //邮箱链接激活帐户

//User相关
router.post('/change_password', UsersController.changePassword);  // 更新密码
router.get('/users', UsersController.getAll);  //获取所有用户列表
router.get('/user/:id', UsersController.getById);  //通过id查找用户
router.get('/user/original/:id', UsersController.getByIdWithOriginal);  //为了安全,使用post获取某人的个人信息
router.put('/user', UsersController.edit);  //用户信息维护
router.delete('/user/:id', UsersController.delete);  //通过id删除用户
router.post('/user/upload', multipartMiddleware, UsersController.uploadAvatar);  //上传头像

// Tags相关
router.get('/tags', TagsController.get); //查找all
router.get('/tags_with_structure', TagsController.getAllWithStructure);
router.get('/tag/:id', TagsController.getById);  //查找某个tag
router.post('/tag', expressJwt(jwtOptions), TagsController.add); //增加
router.put('/tag', expressJwt(jwtOptions), TagsController.edit); //修改
router.delete('/tag/:id', TagsController.delete); //delete

//Article 相关
router.get('/articles', ArticleController.getAll); //查找全部,进行分页设置(api测试)
router.get(/^\/articles\/(\d+)_(\d+)/, ArticleController.getAllWithPages); //分页查找文章,进行分页设置/^\/commits\/(\w+)(?:\.\.(\w+))?$/
router.get('/article/:id', ArticleController.getById); //根据id查找
router.get('/article/raw/:id', ArticleController.getRawById);
router.post('/article', ArticleController.postArt);  //根据id修改/增加,增加的同时对标签使用num++
router.delete('/article/:id', ArticleController.delete); //根据id删除
router.get('/article_history', ArticleController.getHistory); //查询历史记录
router.get(/^\/article_tag\/(\d+)_(\d+)\/(\w+)/, ArticleController.getByTagId); //根据tag_id查找文章列表,具有分页
router.get('/article_tag/:id', ArticleController.getByTagId); //通过标签id查找所有文章
router.get('/article_latest_top/:topNum', ArticleController.getLatestTop); //最新更新Top
router.get('/article_read_top/:topNum', ArticleController.getReadTop); //阅读最多Top
router.get('/tag_used_top/:topNum', TagsController.getUsedTop); //标签top榜单
router.get('/article_top/:topNum', ArticleController.getArticleTops); //上面三个top的集合
router.post('/imgupload', multipartMiddleware, ArticleController.imgUpload); //图片上传，之后还需要uuid找图片,图片压缩,裁剪的功能

//Comments 相关
router.get('/comments', CommentController.getAll); //获取全部
router.get('/comment/:comment_id', CommentController.getById); //查询单个评论(将评论进行组装,还有子评论)
router.post('/comment', CommentController.add); //新增,当用户新增评论的时候,评论的文章的评论数++.对评论进行评论的将前评论的next_id中新增自评论_id
router.put('/comment', CommentController.edit); //修改,基本不用
router.get('/article/comments/:article_id', CommentController.getByArticleId); //根据文章id查询其评论的数组(用于详细的文章调取评论接口)
router.delete('/comment/:id', CommentController.delete); //delete(用于后台删除评论)
router.post('/changeCommentReplyState', CommentController.isIReplied); //checkComments
router.post('/changeCommentAuthState', CommentController.changeState); //改变审核状态
router.get('/commentToArticleList', CommentController.commentToArticle); //commentToArticleList

//Statistic 统计相关
router.get('/statistic', StatisticController.get); //查找all
router.get('/statistic/sign', StatisticController.sign);
router.get('/statistic/all', StatisticController.getAll);
router.delete('/statistic/deleteAll', StatisticController.deleteAll); //total->当日当月当年的数据
router.get('/statistic/total', StatisticController.total); //chart->当前的访问数，折线图
router.get('/statistic/chart', StatisticController.chart);
router.get('/statistic/map', StatisticController.map); //ip->经纬度+访问数


module.exports = router;