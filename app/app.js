/**
 * User: kfs
 * Date：2017/3/26
 * Desc：本地server入口
 */
'use strict'
let express = require('express');
var logger  = require('./utils/logger');  //日志管理
var log4js = require('log4js');
let path = require('path');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');  //请求内容解析中间件
var compression = require('compression');  //gzip压缩中间件
var errorhandler = require('errorhandler');  //错误处理中间件
var cors = require('cors');

var env = process.env.NODE_ENV || 'development';
var config = require('./config/config')[env];

// 引入 mongoose 配置文件,执行配置文件中的函数，以实现数据库的配置和 Model 的创建等
//let mongoose = require('./config/mongoose.js');
let webRouter = require('./routes/web.routes.js'); //主页及后台管理页面
let apiRouter = require('./routes/api.routes.js'); //api入口
let app = express();
//数据库连接
require('./utils/db')(config);

//配置路由基本设置（中间件设置）
app.set('port', process.env.PORT || config.port);
app.use(log4js.connectLogger(logger, {level:log4js.levels.INFO, format:':method :url'}));
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

if ('development' == app.get('env')) {
    app.use(errorhandler());
}

//监听端口设置
if (!module.parent) {
    app.listen(app.get('port'), function () {
        logger.info('blog_server listening on port', app.get('port'));
    });
}

module.exports = app;
