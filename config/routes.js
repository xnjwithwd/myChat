/*
在此匹配不同的路由规则
 */
const Wechat = require('../app/controllers/wechat');
const User = require('../app/controllers/user');

module.exports = router => {
    //进入微信消息中间件
    router.get('/wx-hear', Wechat.hear);
    router.post('/wx-hear', Wechat.hear);
    //二跳，到近授权中间服务页面
    router.get('/wx-oauth', Wechat.oauth);
    //授权后，通过code获取用户信息
    router.get('/userinfo', Wechat.userinfo);

    router.get('/sdk', Wechat.sdk);
    //用户的注册登录路由
    router.get('/user/signup', User.showSignup);
    router.get('/user/signin', User.showSignin);
    router.post('/user/signup', User.signup);
    router.post('/user/signin', User.signin);
};