const {reply} = require('../../wechat/reply');
const config = require('../../config/config');
const wechatMiddle = require('../../wechat-lib/middleware');
const {getOAuth} = require('../../wechat/index');//用于生成oath实例
const api = require('../api/wechat');
/**
 * 用路由的方式管理消息中间件
 * @param ctx
 * @param next
 * @returns {Promise<void>}
 */
exports.hear = async (ctx, next) => {
    const middle = wechatMiddle(config.wechat, reply);
    await middle(ctx, next);
};

/**
 * 进行跳转，去要用户的主动授权，然后会再跳回来
 * @param ctx
 * @param next
 * @returns {Promise<void>}
 */
exports.oauth = async (ctx, next) => {
    const oauth = getOAuth();
    // const target = ctx.href;//跳转地址
    const target = config.baseUrl + 'userinfo';//跳转地址
    const scope = 'snsapi_userinfo';//获取详细信息
    const state = ctx.query.id;
    const url = oauth.getAuthorizeURL(scope, target, state);
    ctx.redirect(url);
};

/**
 * 通过code获取用户的详细信息
 * @param ctx
 * @param next
 * @returns {Promise<void>}
 */
exports.userinfo = async (ctx, next) => {
    const oauth = getOAuth();
    const code = ctx.query.code;
    const tokenData = await oauth.getAccessToken(code);
    ctx.body = await oauth.getUserInfo(tokenData.access_token, tokenData.openid);
};


exports.sdk = async (ctx, next) => {
    const url = ctx.href;
    const params = await api.getSignature(ctx,url);
    params.title='SDK TEST';
    params.desc='测试SDK';
    await ctx.render('wechat/sdk',params);//由于在app.js中配置了views的根目录，所以这里这样即可
    // await ctx.render('wechat/sdk',{
    //     title:'SDK Test',
    //     desc:'测试SDK'
    // })
};