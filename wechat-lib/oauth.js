/*
1.用户访问网页/a
2.服务器构建二跳网页地址/b?state&appid各种参数追加
3.跳到微信授权页，用户授权，跳回到/a?code
4.通过code换取token  code=>wechat url => access_token和openid
5.通过token和openid换取资料access_token=>用户资料
 */

const request = require('request-promise');

const URL = {
    authorize: 'https://open.weixin.qq.com/connect/oauth2/authorize?',
    access_token: 'https://api.weixin.qq.com/sns/oauth2/access_token?',
    userInfo: 'https://api.weixin.qq.com/sns/userinfo?'
};
module.exports = class WechatOAuth {
    constructor(options) {
        this.appID = options.appID;
        this.appSecret = options.appSecret;
    }

    /**
     * 处理request请求，
     * @param options 代入的参数
     * @returns {Promise<void>}
     */
    async request(options) {
        options = Object.assign({}, options, {json: true});//将参数对象化
        try {
            return await request(options);
        } catch (e) {
            console.log(e);
        }
    };

    /**
     * 拼接二跳地址
     * @param scope 标明是获取基本信息还是详细信息【静默受权snsapi_base/主动授权snsapi_userinfo】
     * @param target 授权后重定向的回调链接地址， 请使用 urlEncode 对链接进行处理
     * @param state 重定向后会带上state参数，开发者可以填写a-zA-Z0-9的参数值，最多128字节
     */
    getAuthorizeURL(scope = 'snsapi_base', target, state) {
        return `${URL.authorize}appid=${this.appID}&redirect_uri=${encodeURIComponent(target)}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`
    }

    /**
     * 通过code换取网页授权access_token
     * @param code
     * @returns {Promise<void>}
     */
    async getAccessToken(code) {
        // https://api.weixin.qq.com/sns/oauth2/access_token?appid=APPID&secret=SECRET&code=CODE&grant_type=authorization_code
        const url = `${URL.access_token}appid=${this.appID}&secret=${this.appSecret}&code=${code}&grant_type=authorization_code`;
        return await this.request({url});
    }

    /**
     * 拉取用户信息(需scope为 snsapi_userinfo)
     * @param token
     * @param openID
     * @param lang 语言，默认为中文
     * @returns {Promise<void>}
     */
    async getUserInfo(token, openID, lang = 'zh_CN') {
        const url = `${URL.userInfo}access_token=${token}&openid=${this.appID}&lang=${lang}`;
        return await this.request({url})
    }
};