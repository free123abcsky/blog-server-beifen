/**
 * User: kfs
 * Date：2017/3/30
 * Desc：认证控制器测试
 */
var should = require('chai').should();
var expect = require('chai').expect;
var supertest = require('supertest');
var crypto = require('crypto');
var env = process.env.NODE_ENV || 'development';
var config = require('../../app/config/config')[env];
var api = supertest('http://localhost:8080');

describe('test/controllers/auth.test.js', function() {

    var now = +new Date();
    //var email = 'fansuo_k@163.com';
    //var email = 'testuser' + now + '@163.com';
    var email = '990080536@qq.com';
    var password = '123456abc';

    describe('sign up', function () {

        it('should sign up a user', function(done){
            api.post('/api/signup')
                .send({
                    email: email,
                    password: password,
                })
                .expect(200)
                .end(function(err, res){
                    expect(res.body.data).to.have.property('token');
                    expect(res.body.data).to.have.property('user');
                    done();
                })
        });

        it('should not sign up a user when email is exists', function (done) {
            api.post('/api/signup')
                .send({
                    email: '990080536@qq.com',
                    password: password,
                })
                .end(function(err, res){

                    expect(res.body.status.msg).to.equal('该用户已存在')
                    done();
                })
        });

    });

    describe('account active', function () {
        var sign = '';
        var userId = '';
        before(function(done){
            api.post('/api/signup')
                .send({
                    email: 'fansuo_k1@163.com',
                    password: '123456abc',
                })
                .expect(200)
                .end(function(err, res){
                    expect(res.body.data).to.have.property('user');
                    expect(res.body.data.user).to.have.property('_id');
                    var md5 = crypto.createHash('md5');
                    userId = res.body.data.user._id;
                    sign = md5.update(config.sessionSecret + userId).digest('hex');
                    done();
                })
        });

        it('should active account', function (done) {
            api.get('/api/users/' + userId + '/verify?confirm_token=' + sign)
                .expect(200)
                .end(function(err, res){
                    expect(res.body.data).to.have.property('token');
                    done();
                })
        });
    });

    describe('sign in', function () {

        it('should error when no email or no password', function(done){
            api.post('/api/signin')
                .send({
                    email: email,
                    password: '',
                })
                .expect(403)
                .end(function(err, res){
                    expect(res.body.status.msg).to.equal('信息不完整');
                    done();
                })
        });

        it('should sign in a user', function(done){
            api.post('/api/signin')
                .send({
                    email: '990080536@qq.com',
                    password: '123456abc',
                })
                .expect(200)
                .end(function(err, res){
                    expect(res.body.data).to.have.property('token');
                    expect(res.body.data).to.have.property('user');
                    done();
                })
        });


    });

});
