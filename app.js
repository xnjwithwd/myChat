const Koa = require('koa');
const Router = require('koa-router');
const{resolve} = require('path');//用于拼接地址
const moment = require('moment');//时间库
const config = require('./config/config');
const {reply} = require('./wechat/reply');


(async () => {
    // const {test} = require('./wechat/index');
    // await test();//测试数据库

    //生成服务器实例
    const app = new Koa();
    const router = new Router();

    const views = require('koa-views');//引入模板引擎
    app.use(views(resolve(__dirname + '/app/views'), {//配制了view的根目录
        extension: 'pug',
        options: {
            moment: moment
        }
    }));

    //接入微信消息中间件
    require('./config/routes')(router);
    app.use(router.routes()).use(router.allowedMethods());//让路由中间件生效
    //加载认证的中间件,ctx是Koa的应用上下文，next是串联中间件的构造函数
    //app.use(require('./wechat-lib/middleware')(config.wechat, reply));//这里的reply相当于reply.reply

    app.listen(config.port);
    console.log('Listen: ', config.port);
})();
