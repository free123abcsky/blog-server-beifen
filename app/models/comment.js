/**
 * User: kfs
 * Date：2017/4/2
 * Desc：评论数据模型
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var commentSchema = new Schema({
    //自动维护
    article_id: {type: Schema.Types.ObjectId, ref: 'Article'},//记录此评论所属的文章_id
    pre_id: String,//钩子的id。即,上一条父记录id,如果没有则为根id->article_id(必须)
    next_id: [{
        type: Schema.Types.ObjectId, ref: 'Comment'
    }],//沟槽id,即,下一条记录的id,一般是子评论的id。
    //
    isIReplied: {type: Boolean, default: false},//我是否回复过?
    //
    name: {type: String, default: '评论人姓名'},//评论人姓名、昵称
    email: String,//评论人邮箱
    time: Date,//评论时间,时间戳
    content: {type: String, default: '评论内容'},//评论内容
    ip: String,//对方ip
    state: {type: Boolean, default: false},//是否审核通过 0, 未审核通过 1 审核通过
});

mongoose.model('Comment', commentSchema);