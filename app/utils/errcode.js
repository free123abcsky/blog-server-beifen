/**
 * User: kfs
 * Date：2017/4/12
 * Desc：自定义错误码配置
 */

module.exports = {
    'OK': 0,  //请求成功
    'PARAM_ERROR': 10001,  //参数错误
    'DATA_NOT_FOUND': 10002,  //数据不存在
    'DATA_EXISTED': 10003,  //数据已存在
    'DATA_INVALID': 10004,  //数据无效
    'LOGIN_REQUIRED': 10005,  //登录失败
    'PERMISSION_DENIED': 10006,  //权限不足
    'TOKEN_EXPIRE': 10007,  //token过期
}
