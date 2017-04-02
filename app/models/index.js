/**
 * User: kfs
 * Date：2017/4/2
 * Desc：数据模型导出
 */
var mongoose = require('mongoose');

require('./user');
require('./statistic');
require('./tag');
require('./article');
require('./comment');

exports.User = mongoose.model('User');
exports.Statistic = mongoose.model('Statistic');
exports.Tag = mongoose.model('Tag');
exports.Article = mongoose.model('Article');
exports.Comment = mongoose.model('Comment');
