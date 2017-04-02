/**
 * User: kfs
 * Date：2017/4/2
 * Desc：标签数据模型
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TagSchema = new Schema({
    name: {type: String, default: '标签名称'},//标签名称 eg: css html
    catalogue_name: {type: String, default: '分类名称'},//分类名称 eg: FrontEnd
    used_num: {type: Number, default: 0},//文章引用数
    create_time: {type: Date, default: (new Date())},//创建时间 时间戳
});

mongoose.model('Tag', TagSchema);