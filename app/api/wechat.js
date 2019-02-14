const {getOAuth, getWechat} = require('../../wechat/index');
const util = require('../../wechat-lib/util');

exports.getSignature = async (ctx, url) => {
    const client = getWechat();
    const data = await client.getAccessToken();
    const token = data.access_token;
    const ticketData = await client.getTicket(token);
    const ticket = ticketData.ticket;
    let params = util.sign(ticket, url);
    params.appId = client.appID;
    return params
};

exports.getAuthorizeURL = async (scope, target, state) => {
    const oauth = getOAuth();
    return await oauth.getAuthorizeURL(scope, target, state);
};