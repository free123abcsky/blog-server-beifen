/**
 * User: kfs
 * Date：2016/11/5
 * Desc：基本配置
 */

module.exports = {
  development: {
    name: '云空间', // 社区名字
    db: 'mongodb://localhost:27017/blog_dev', // 连接字符串格式为mongodb://主机/数据库名
    baiduAK:"yFKaMEQnAYc1hA0AKaNyHGd4HTQgTNvO",
    port: '8080',
    sessionSecret: 'what should i do?'
  },
  production: {

    name: '云空间', // 社区名字
    db: 'mongodb://localhost:27017/blog', // 连接字符串格式为mongodb://主机/数据库名
    baiduAK:"yFKaMEQnAYc1hA0AKaNyHGd4HTQgTNvO",
    port: '8080',
    sessionSecret: 'what should i do?',
  }
};

