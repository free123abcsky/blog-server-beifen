/**
 * Created by xiangsongtao on 16/3/3.
 */
'use strict'
let fs = require('fs');
//MyInfo的数据模型
let Articles = require('../models').Article;
let Comments = require('../models').Comment;
var ERROR  = require('../utils/errcode');

/**
 * 更新文章的评论数
 * 不是对文章的评论数做++处理，--处理也通用
 * 而是通过articleid找comment的count，之后再保存。2016/11/5
 * */
function refreshArticleCommentNum(article_id) {
	return new Promise(function (resolve, reject) {
		Comments.count({article_id: article_id}, function (err, count) {
			if (err) {
				reject('refreshArticle: count comment by article_id failed!');
			}
			Articles.findOne({_id: article_id}, function (err, article) {
				if (err) {
					reject('refreshArticle: find article by article_id failed!');
				}
				if (!!article) {
					article.comment_num = parseInt(count);
					article.save(function (err) {
						resolve();
					});
				} else {
					reject('refreshArticle: find article by article_id failed,article not found!');
				}
			});
		})
	});
}


module.exports = {
	getAll: function (req, res, next) {
		Comments.find({}, function (err, docs) {
			if (err) {
                res.retError({code: ERROR.SYSTEM_ERROR, msg: err.message});
				return next();
			}
			res.retJson(docs);
		})
	},
	/**
	 * 根据评论的id获取对应的评论信息，区分获取的是根评论还是子评论
	 * */
	getById: function (req, res, next) {
		//循环请求更具id获取评论信息
		let CommentsArr = [];

		function getCommentDetail(arr) {
			let totalLen = arr.length;
			let recordLen = 0;
			return new Promise(function (resolve, reject) {
				//执行
				getComment(arr);

				//函数定义
				function getComment(arr) {
					// console.log(`获取id:${arr[recordLen]}`);
					Comments.findOne({_id: arr[recordLen]}, function (err, comment) {
						if (err) {
                            res.retError({code: ERROR.SYSTEM_ERROR, msg: err.message});
							reject();
							return next();
						}
						recordLen++;
						if (!!comment) {
							CommentsArr.push(comment);
						}

						if (totalLen === recordLen) {
							//请求完毕
							resolve();
						} else {
							//还有未请求的数据
							getComment(arr);
						}
					});
				}
			})
		}

		Comments.findOne({_id: req.params.comment_id}, function (err, comment) {
			if (err) {
                res.retError({code: ERROR.SYSTEM_ERROR, msg: err.message});
				return next();
			}
			if (!!comment) {
				CommentsArr.push(comment);

				if (comment.article_id.toString() === comment.pre_id.toString() && comment.next_id.length > 0) {
					//在这个情况下,next_id是可能有值的。
					getCommentDetail(comment.next_id).then(function () {
						res.retJson(CommentsArr);
					}, function () {
						res.retError({code: ERROR.DATA_NOT_FOUND, msg: 'get sub comment by comment_id failure!'});
					});
				} else {
					res.retJson(CommentsArr);
				}

			} else {
				res.retError({code: ERROR.DATA_NOT_FOUND, msg: '评论信息不存在'});
			}
		})
	},
	edit: function (req, res, next) {
		Comments.findOne({_id: req.body._id}, function (err, comment) {
			if (err) {
                res.retError({code: ERROR.SYSTEM_ERROR, msg: err.message});
				return next();
			}
			if (!!comment) {
				let {name, email, time, content, ip, state} = req.body;
				//数据写入并保存
				comment.name = name;
				comment.email = email;
				comment.time = time;
				comment.content = content;
				comment.ip = ip;
				comment.state = state;
				//保存
				comment.save();
				res.retJson(comment);
			} else {
				res.retError({code: ERROR.DATA_NOT_FOUND, msg: '评论维护失败，评论信息不存在'});
			}
		});
	},
	delete: function (req, res, next) {
		function removeComment(nextId, cb) {
			if(nextId.length>0){
				Comments.remove({_id: nextId.pop()}, function (err) {
					removeComment(nextId,cb)
				});
			}else{
				!!cb && cb();
			}
		}

		Comments.findOne({_id: req.params.id}, function (err, comment) {
			if (err) {
                res.retError({code: ERROR.SYSTEM_ERROR, msg: err.message});
				return next();
			}
			if (!!comment) {
				let articleId = comment.article_id;
				let nextId = comment.next_id;
				let preId = comment.pre_id;
				comment.remove(function (err) {
					if (err) {
                        res.retError({code: ERROR.SYSTEM_ERROR, msg: err.message});
						return next();
					}
					refreshArticleCommentNum(articleId).then(function () {
						if (nextId.length > 0) {
							//删除的评论是父评论
							removeComment(nextId,function () {
								res.retSuccess({code: 0, msg: '删除该评论成功'});
							});
						} else {
							//删除的评论是子评论,还需要更新父评论
							Comments.findOne({_id: preId}, function (err, preComment) {
								if (err) {
                                    res.retError({code: ERROR.SYSTEM_ERROR, msg: err.message});
									return next();
								}
								if (!!preComment && preComment.next_id > 0) {
									//更新的是子评论,需要到父级去除自己的信息
									preComment.next_id.splice(preComment.next_id.indexOf(comment._id), 1);
									preComment.save(function (err) {
										if (err) {
                                            res.retError({code: ERROR.SYSTEM_ERROR, msg: err.message});
											return next();
										}
                                        res.retSuccess({code: 0, msg: '删除该评论成功'});

									});
								} else {
                                    res.retSuccess({code: 0, msg: '删除该评论成功'});
								}
							})
						}
					}, function (errMsg) {
						res.retJson({code: ERROR.SYSTEM_ERROR, msg: errMsg});
					});
				});
			} else {
                res.retSuccess({code: 0, msg: '删除该评论成功'}); //评论未找到，默认为删除成功
			}
		})
	},
	/**
	 * 根据文章的id获取对应的评论信息
	 * */
	getByArticleId: function (req, res, next) {
		Comments.find({article_id: req.params.article_id, pre_id: req.params.article_id, state: true})
		.populate({
			path: "next_id",
			match: {state: true},
			options: {sort: {time: -1}}
		})
		.sort('-time')
		.exec(function (err, commentList) {
			res.retJson(commentList);
		});
	},
	/**
	 * 新增评论，每次信息都会统计文章的评论数。todo
	 * */
	add: function (req, res, next) {
		let {article_id, pre_id, next_id, name, email, time, content, ip, isIReplied, state} =  req.body;
		let comment = new Comments({
			article_id,
			pre_id,
			next_id,
			name,
			email,
			time,
			content,
			ip,
			isIReplied,
			state
		});


		/**
		 * 将子评论添加到父评论中，更新父评论的next_id信息，
		 * @param comment 子评论的对象
		 * */
		function addToPreComment(comment) {
			return new Promise(function (resolve, reject) {
				Comments.findOne({_id: comment.pre_id}, function (err, preComment) {
					if (err) {
						reject('refreshPreComment: find pre_id err!');
					}
					if (!!preComment) {
						if (preComment.article_id.toString() === preComment.pre_id.toString()) {
							//对根评论进行修改
							preComment.next_id.push(comment._id);
							//当前子评论关闭子子评论
							comment.next_id = [];
							preComment.save(function (err) {
								resolve();
							});
						} else {
							reject('refreshPreComment: pre_id is not a root comment!');
						}
					} else {
						reject('refreshPreComment: pre_id not found!');
					}
				})
			});
		}

		//保存评论
		comment.save(function (err) {
			if (err) {
                res.retError({code: ERROR.SYSTEM_ERROR, msg: err.message});
				return next();
			}
			refreshArticleCommentNum(article_id).then(function () {
				if (comment.article_id.toString() !== comment.pre_id.toString()) {
					//如果当前的评论是个子评论
					//需要修改父评论的next_id信息，使其指向子评论
					addToPreComment(comment).then(function () {
						res.retSuccess({code: 0, msg: '添加评论成功'});
					}, function (errMsg) {
                        res.retSuccess({code: ERROR.SYSTEM_ERROR, msg: '添加评论失败，' + errMsg});
					})
				} else {
                    res.retSuccess({code: 0, msg: '添加评论成功'});
				}
			}, function (errMsg) {
                res.retSuccess({code: ERROR.SYSTEM_ERROR, msg: '添加评论失败，' + errMsg});
			});
		});
	}
	,
//只是修改我对此评论的回复状态
//此接口只对我有效
	isIReplied: function (req, res, next) {
		Comments.findOne({_id: req.body._id}, function (err, comment) {
			if (err) {
                res.retError({code: ERROR.SYSTEM_ERROR, msg: err.message});
				return next();
			}
			if (!!comment) {
				//数据写入并保存
				comment.isIReplied = true;
				//保存
				comment.save();
                res.retSuccess({code: 0, msg: '评论回复数据修改成功'});
			} else {
                res.retError({code: ERROR.DATA_NOT_FOUND, msg: '评论回复数据修改失败， 评论不存在'});
			}
		});
	}
	,
//修改审核情况
	changeState: function (req, res, next) {
		Comments.findOne({_id: req.body._id}, function (err, comment) {
			if (err) {
                res.retError({code: ERROR.SYSTEM_ERROR, msg: err.message});
				return next();
			}
			if (!!comment) {
				comment.state = !comment.state;
				//保存
				comment.save();
				res.retSuccess({code: 0, msg: '评论状态修改成功'});
			} else {
                ret.retError({code: ERROR.DATA_NOT_FOUND, msg: '评论状态修改失败， 评论不存在'});
			}
		});
	}
	,
	commentToArticle: function (req, res, next) {
		// Comments.$where('this.article_id == this.pre_id')
		// Comments
		// .where('isIReplied', false)
		Comments.find().populate({
			path: "article_id",
			select: {title: 1}
		}).exec(function (err, commentList) {
            res.retJson(commentList);
		})
	}
}
;






