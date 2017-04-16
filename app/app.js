/**
 * User: kfs
 * Date：2017/3/26
 * Desc：本地server入口
 */
'use strict'
let express = require('express');
var logger  = require('./utils/logger');  //日志管理
var resapi = require('./middlewares/res.api.js');
var log4js = require('log4js');
let path = require('path');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');  //请求内容解析中间件
var compression = require('compression');  //gzip压缩中间件
var errorhandler = require('errorhandler');  //错误处理中间件
var cors = require('cors');
var ERROR  = require('./utils/errcode');
var env = process.env.NODE_ENV || 'development';
var config = require('./config/config')[env];

let webRouter = require('./routes/web.routes.js'); //主页及后台管理页面
let apiRouter = require('./routes/api.routes.js'); //api入口
let app = express();
//数据库连接
require('./utils/db')(config);

//配置路由基本设置（中间件设置）
app.set('port', process.env.PORT || config.port);
app.use(log4js.connectLogger(logger, {level:log4js.levels.INFO, format:':method :url'}));
app.use(resapi);
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(compression());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'), {
    etag: false, //资源标记
    maxAge: 0,//30 days 后过期, 单位ms
    setHeaders: function (res, path, state) {
        if(/\.(js|css|png|gif|jpg|jpeg|ico|mp3)$/.test(path)){
            // 未来的一个过期时间
            res.set('Expires', new Date(Date.now() + 2592000*1000).toGMTString())
            res.set('Cache-Control', 'public, max-age=2592000')
        }
    }
}));
app.use('/', webRouter);
app.use('/api', apiRouter);
//
// if ('development' == app.get('env')) {
//     app.use(errorhandler());
// }else {
//     app.use(function (err, req, res, next) {
//         logger.error(err);
//         if (err.name === 'UnauthorizedError') {
//             if(err.inner.name === 'TokenExpiredError'){
//                 res.retError({code: ERROR.TOKEN_EXPIRE, msg: 'token过期，请重新登录'});
//             }
//             res.retError({code: ERROR.PERMISSION_DENIED, msg: '您的权限不足'});
//         }
//         res.status(500).send('500 status');
//     });
// }

app.use(function (err, req, res, next) {
    logger.error(err);
    if (err.name === 'UnauthorizedError') {
        if(err.inner.name === 'TokenExpiredError'){
            return res.retError({code: ERROR.TOKEN_EXPIRE, msg: 'token过期，请重新登录'});
        }
        res.retError({code: ERROR.PERMISSION_DENIED, msg: '您的权限不足'});
    }
    res.status(500).send('500 status');
});

//监听端口设置
if (!module.parent) {
    app.listen(app.get('port'), function () {
        logger.info('blog_server listening on port', app.get('port'));
    });
}

module.exports = app;
