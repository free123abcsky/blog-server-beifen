/**
 * User: kfs
 * Date：2017/4/2
 * Desc：文章数据模型
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ArticleSchema = new Schema({
    title: {type: String, default: '文章标题'},//文章标题
    publish_time: {type: Date, default: (new Date())},//文章发表时间
    last_modify_time:{type: Date, default: (new Date())},//最后修改时间
    read_num: {type: Number, default: 0},//阅读数
    comment_num: {type: Number, default: 0}, //评论数,当评论新增的时候进行++操作
    tags: [{
        type: Schema.Types.ObjectId, ref: 'Tag'
    }],                            //标签,包含标签的id array
    state: {type: Boolean, default: false}, //是否公开 0 草稿(不公开) 1 完成(公开)
    abstract:{type: String, default: null},//文章摘要
    content: {type: String, default: '文章内容(Markdown文本)'},//内容 markdown文本
    html:{type: String, default: null},//内容 HTML文本
});

mongoose.model('Article', ArticleSchema);