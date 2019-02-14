const sha1 = require('sha1');
const getRawBody = require('raw-body');
const util = require('./util');

/**
 * 微信回复主程序
 * @param config 代入的参数
 * @param reply 回复方法
 * @returns {Function}
 */
module.exports = (config,reply) => {
    return async (ctx, next) => {
        const {
            signature,
            timestamp,
            nonce,
            echostr
        } = ctx.query;//获取请求参数
        //排序
        let str = [config.token, timestamp, nonce].sort().join('');
        const sha = sha1(str);//加密

        // console.log('query:  ',ctx.query);
        // console.log('sha:',sha,'   ','signature:',signature);

        //验证是不是来自微信
        if (ctx.method === 'GET') {
            if (sha === signature) {
                ctx.body = echostr;
            } else {
                ctx.body = 'wrong';
            }
        } else if (ctx.method === 'POST') {
            if (sha !== signature) {
                return ctx.body = 'wrong';
            }
            const data = await getRawBody(ctx.req, {
                length: ctx.length,
                limit: '1mb',    //设定数据大小
                encoding: ctx.charset
            });

            // console.log('data  :  ', data);////////////////////////////////////////

            const content = await util.parseXML(data);
            const message = util.formatMessage(content.xml);//解析xml

            // console.log('message:  ', message);////////////////////////////////////
            ctx.weixin = message;//将message给上下文
            //apply让reply拥有当前的上下文
            await reply.apply(ctx,[ctx,next]);//调用reply方法

            //将reply数据加入到模板中
            const replyBody = ctx.body;
            const msg = ctx.weixin;
            const xml = util.temple(replyBody,msg);//根据信息，将数据包装成合规的xml文件，用于回复
            // console.log('xml: ',xml);////////////////////////////////////////////////

            ctx.status = 200;
            ctx.type = 'application/xml';
            ctx.body = xml;
        }
    }
};