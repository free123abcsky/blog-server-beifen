/**
 * User: kfs
 * Date：2017/4/4
 * Desc：api middleware
 */

function retJson(){
    var _res = this;

    if(typeof(_res) != "object" && _is_not_has_prototype('end')){
        arguments = [];
        console.dir('not a object')
    }

    if (arguments.length == 1) {
        var http_code = 200;
        var api_data      = arguments[0];
        var api_status    = {
            code : 0,
            msg  : 'request success!'
        }

        return _api(http_code, api_data, api_status);
    } else if (arguments.length == 2) {
        var http_code = 200;
        var api_data      = arguments[0];
        var api_status    = arguments[1];

        return _api(http_code, api_data, api_status);
    } else if (arguments.length == 3) {
        var http_code = arguments[0];
        var api_data      = arguments[1];
        var api_status    = arguments[2];

        return _api(http_code, api_data, api_status);
    } else {
        var http_code = 200;
        var api_data      = {};
        var api_status    = {
            code : 222222222,
            msg  : 'res.api params error or res is not a express.response object!'
        }

        return _api(http_code, api_data, api_status);
    }

    function _is_not_has_prototype(name){
        return !_res.hasOwnProperty(name)&&(name in _res);
    }

    function _api (http_code, data, status) {
        if (_res.is_jsonp && _res.is_jsonp == true) {
            return _res.status(http_code).jsonp({
                data    : data,
                status  : status
            })
        } else {
            return _res.status(http_code).json({
                data    : data,
                status  : status
            })
        }
    }
}

function retError(status){
    var _res = this;

    status.code = status.code || -1;
    status.msg = status.msg || 'api error';

    _res.status(200).json({
        status  : status
    });
}

module.exports = function(req, res, next) {

    res.retJson = retJson;
    res.retError = retError;

    next();
};
