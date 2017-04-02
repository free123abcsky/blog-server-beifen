/**
 * User: kfs
 * Date：2017/4/2
 * Desc：访问统计模型
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var StatisticSchema = new Schema({
    time: Date,//当前访问时间,默认当前时间
    ip: String,// 访问的ip
    path:String,// 访问的路径
});

mongoose.model('Statistic', StatisticSchema);