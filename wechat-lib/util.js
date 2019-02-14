const xml2js = require('xml2js');
const template = require('./temple');
const sha1 = require('sha1');

/**
 * 解析XML文件
 * @param xml 传入的文件
 * @returns {Promise<json>} 返回一个json对象
 */
exports.parseXML = xml => {
    return new Promise((resolve, reject) => {
        xml2js.parseString(xml, {trim: true}, (err, content) => {
            if (err) reject(err);
            else resolve(content);
        })
    })
};

/**
 * 将数据转化为一个对象
 * @param result
 */
const formatMessage = result => {
    let message = {};
    if (typeof result === 'object') {
        const keys = Object.keys(result);
        for (let i = 0; i < keys.length; i++) {
            let item = result[keys[i]];
            let key = keys[i];

            //如果不是数组，或长度为0
            if (!(item instanceof Array) || item.length === 0) {
                continue;
            }
            if (item.length === 1) {
                let val = item[0];
                if (typeof val === 'object') {
                    message[key] = formatMessage(val);
                } else {
                    message[key] = (val || '').trim();
                }
            } else {
                message[key] = [];
                for (let j = 0; j < item.length; j++) {
                    message[key].push(formatMessage(item[j]));//递归
                }
            }
        }
    }
    return message;
};

const temple = (content, message) => {
    let type = 'text';//设定默认为文本消息
    if (Array.isArray(content)) {
        type = 'news';//如果是数组，说明是图文消息
    }
    if (!content) content = 'Empty News!';
    if (content && content.type) {
        type = content.type;//如果消息存在且有type类型，则将类型设定为content的type
    }
    //数据的扩展[继承]
    let info = Object.assign({}, {
        content: content,
        msgType: type,
        createTime: new Date().getTime(),
        toUserName: message.FromUserName,//此处，为了将信息发回用户，所以接收人就是收到信息时的发送人
        fromUserName: message.ToUserName
    });

    return template(info);//将模板中加入数据
};

///////////////////////////////////////////////////////////////////////////////////////

/**
 * 生成随机字符串
 * @returns {string}
 */
const createNonce = () => {
    return Math.random().toString(36).substr(2, 16);
};

/**
 * 生成时间戳
 * @returns {string}
 */
const createTimestame = () => {
    return parseInt(new Date().getTime() / 1000, 10) + ''
};

/**
 * 进行字典排序
 * @param paramsObj
 * @returns {string}
 */
const signIt = (paramsObj) => {
    let keys = Object.keys(paramsObj);
    let newArgs = {};
    let str = '';
    keys = keys.sort();
    keys.forEach(key => {
        newArgs[key.toLowerCase()] = paramsObj[key];
    });
    for (let k in newArgs) {
        str += `&${k}=${newArgs[k]}`;
    }
    return str.substr(1);
};

/**
 * 进行加密
 * @param nonce
 * @param ticket
 * @param timestamp
 * @param url
 * @returns {*}
 */
const shaIt = (nonce, ticket, timestamp, url) => {
    const ret = {
        jsapi_ticket: ticket,
        nonceStr: nonce,
        timestamp,
        url,
    };
    const str = signIt(ret);
    return sha1(str);//返回加密值
};

/**
 * 加密签名的入口方法
 * @param ticket
 * @param url
 * @returns {{signature: *, nonce: string, timestamp: string}}
 */
const sign = (ticket, url) => {
    const nonceStr = createNonce();
    const timestamp = createTimestame();
    const signature = shaIt(nonceStr, ticket, timestamp, url);//加密

    return {
        nonceStr,
        timestamp,
        signature
    }
};

exports.formatMessage = formatMessage;
exports.temple = temple;
exports.sign = sign;
