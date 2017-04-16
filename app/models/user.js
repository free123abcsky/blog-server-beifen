/**
 * User: kfs
 * Date：2017/4/2
 * Desc：我的个人信息数据模型
 */
var bcrypt = require('bcryptjs');  //引入加密模块
var mongoose = require('mongoose');
var Schema = mongoose.Schema;  //一种以文件形式存储的数据库模型骨架，不具备数据库的操作能力

/**
 * 定义一个Schema  schema是mongoose里会用到的一种数据模式，可以理解为表结构的定义
 * id由数据库自己生成,名字为_id
 */
var UserSchema = new Schema({
    email: {type: String, required: true},//邮箱
    username: {type: String, default: ''},//名字
    passwordHash: {type: String, default: ''},//密码
    is_admin: Boolean,//用户权限组,true:admin组;false:visitor组
    login_info: [
        {
            login_time: Date,//回复时间
            login_ip: String,//登录IP地址
        }
    ],
    full_name: {type: String, default: '名字'},//名字
    position: {type: String, default: '职位'},//职位
    address: {type: String, default: '地址'},//地址
    motto: {type: String, default: '心情'},//心情
    personal_state: {type: String, default: '我的称述'},//我的称述
    img_url: {type: String, default: ''},//头像imgurl
    createdAt: {type: Date, default: Date.now},
    activated: {type: Boolean, default: false}
});

UserSchema
    .virtual('password')
    .set(function (password) {
        var salt = bcrypt.genSaltSync(10);
        this.passwordHash = bcrypt.hashSync(password, salt);
    })
    .get(function () { return this.passwordHash; });

UserSchema.methods = {
    auth: function (password) {
        return bcrypt.compareSync(password, this.passwordHash);
    }
};

UserSchema.index({email: 1});

//Model 由Schema发布生成的模型，具有抽象属性和行为的数据库操作对
//将该Schema发布为Model并导出
mongoose.model('User', UserSchema);
