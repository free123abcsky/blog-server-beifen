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

    describe('test', function () {
        it('should sign up a user', function(){
            expect(2).to.be.equal(2);
        })
    });

})