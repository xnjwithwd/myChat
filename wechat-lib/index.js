const request = require('request-promise');
const fs = require('fs');
const _ = require('lodash');
const base = 'https://api.weixin.qq.com/cgi-bin/';
const mpBase = 'https://mp.weixin.qq.com/cgi-bin/';
//语义理解https://api.weixin.qq.com/semantic/semproxy/search?access_token=YOUR_ACCESS_TOKEN
const semantic = 'https://api.weixin.qq.com/semantic/semproxy/search?';
const additionalUrl = {
    //https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET
    accessToken: base + 'token?grant_type=client_credential',
    semantic: semantic,
    //临时素材
    temporary: {
        //https://api.weixin.qq.com/cgi-bin/media/upload?access_token=ACCESS_TOKEN
        upload: base + 'media/upload?',
        //https://api.weixin.qq.com/cgi-bin/media/get?access_token=ACCESS_TOKEN&media_id=MEDIA_ID
        fetch: base + 'media/get?'
    },
    //永久素材
    permanent: {//https://api.weixin.qq.com/cgi-bin/material/add_news?access_token=ACCESS_TOKEN上传永久素材的URL
        uploadNews: base + 'material/add_news?',//图文
        //https://api.weixin.qq.com/cgi-bin/media/uploadimg?access_token=ACCESS_TOKEN
        uploadNewsImg: base + 'media/uploadimg?',//图片，上传图文消息内的图片获取URL
        //https://api.weixin.qq.com/cgi-bin/material/add_material?access_token=ACCESS_TOKEN&type=TYPE
        uploadMaterial: base + 'material/add_material?',//新增其他类型永久素材
        //获取永久素材https://api.weixin.qq.com/cgi-bin/material/get_material?access_token=ACCESS_TOKEN
        fetch: base + 'material/get_material?',
        //删除永久素材https://api.weixin.qq.com/cgi-bin/material/del_material?access_token=ACCESS_TOKEN
        delete: base + 'material/del_material?',
        //修改永久素材https://api.weixin.qq.com/cgi-bin/material/update_news?access_token=ACCESS_TOKEN
        update: base + 'material/update_news?',
        //获取素材总数https://api.weixin.qq.com/cgi-bin/material/get_materialcount?access_token=ACCESS_TOKEN
        totalNumber: base + 'material/get_materialcount?',
        //获取素材列表https://api.weixin.qq.com/cgi-bin/material/batchget_material?access_token=ACCESS_TOKEN
        materialList: base + 'material/batchget_material?'
    },
    //标签
    tag: {
        //标签
        //创建分组(标签)https://api.weixin.qq.com/cgi-bin/tags/create?access_token=ACCESS_TOKEN
        create: base + 'tags/create?',
        //获取公众号已创建的标签https://api.weixin.qq.com/cgi-bin/tags/get?access_token=ACCESS_TOKEN
        get: base + 'tags/get?',
        //编辑标签https://api.weixin.qq.com/cgi-bin/tags/update?access_token=ACCESS_TOKEN
        update: base + 'tags/update?',
        //删除标签https://api.weixin.qq.com/cgi-bin/tags/delete?access_token=ACCESS_TOKEN
        delete: base + 'tags/delete?',
        //获取标签下粉丝列表https://api.weixin.qq.com/cgi-bin/user/tag/get?access_token=ACCESS_TOKEN
        getFans: base + 'user/tag/get?',
        //用户管理
        //批量为用户打标签https://api.weixin.qq.com/cgi-bin/tags/members/batchtagging?access_token=ACCESS_TOKEN
        batchTagging: base + 'tags/members/batchtagging?',
        //批量为用户取消标签https://api.weixin.qq.com/cgi-bin/tags/members/batchuntagging?access_token=ACCESS_TOKEN
        batchUntagging: base + 'tags/members/batchuntagging?',
        //获取用户身上的标签列表https://api.weixin.qq.com/cgi-bin/tags/getidlist?access_token=ACCESS_TOKEN
        getIdList: base + 'tags/getidlist?'
    },
    //用户管理
    user: {
        //设置用户备注名https://api.weixin.qq.com/cgi-bin/user/info/updateremark?access_token=ACCESS_TOKEN
        remark: base + 'user/info/updateremark?',
        //获取用户基本信息(UnionID机制)https://api.weixin.qq.com/cgi-bin/user/info?access_token=ACCESS_TOKEN&openid=OPENID&lang=zh_CN
        info: base + 'user/info?',
        //批量获取用户基本信息https://api.weixin.qq.com/cgi-bin/user/info/batchget?access_token=ACCESS_TOKEN
        batchInfo: base + 'user/info/batchget?',
        //获取用户列表https://api.weixin.qq.com/cgi-bin/user/get?access_token=ACCESS_TOKEN&next_openid=NEXT_OPENID
        getUserList: base + 'user/get?'
    },
    //消息群发
    mass: {
        //根据标签进行群发https://api.weixin.qq.com/cgi-bin/message/mass/sendall?access_token=ACCESS_TOKEN
        sendByTag: base + 'message/mass/sendall?',
        //根据OpenID列表群发【订阅号不可用，服务号认证后可用】https://api.weixin.qq.com/cgi-bin/message/mass/send?access_token=ACCESS_TOKEN
        sendByOpenId: base + 'message/mass/send?',
        //https://api.weixin.qq.com/cgi-bin/message/mass/delete?access_token=ACCESS_TOKEN
        delete: base + 'message/mass/delete?',
        //预览接口【订阅号与服务号认证后均可用】https://api.weixin.qq.com/cgi-bin/message/mass/preview?access_token=ACCESS_TOKEN
        preview: base + 'message/mass/preview?',
        //https://api.weixin.qq.com/cgi-bin/message/mass/get?access_token=ACCESS_TOKEN
        checkMass: base + 'message/mass/get?'
    },
    //菜单管理
    menu: {
        //自定义菜单创建接口,http请求方式：POST（请使用https协议）https://api.weixin.qq.com/cgi-bin/menu/create?access_token=ACCESS_TOKEN
        create: base + 'menu/create?',
        //自定义菜单查询接口,http请求方式：GET,https://api.weixin.qq.com/cgi-bin/menu/get?access_token=ACCESS_TOKEN
        get: base + 'menu/get?',
        //自定义菜单删除接口,http请求方式：GET,https://api.weixin.qq.com/cgi-bin/menu/delete?access_token=ACCESS_TOKEN
        delete: base + 'menu/delete?',
        //获取自定义菜单配置接口,http请求方式: GET（请使用https协议）https://api.weixin.qq.com/cgi-bin/get_current_selfmenu_info?access_token=ACCESS_TOKEN
        current: base + 'get_current_selfmenu_info?',
        //创建个性化菜单https://api.weixin.qq.com/cgi-bin/menu/addconditional?access_token=ACCESS_TOKEN
        custom: base + 'menu/addconditional?'
    },
    qrcode: {
        //二维码相关
        //URL: https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=TOKEN
        create: base + 'qrcode/create?',
        //HTTP GET请求（请使用https协议）https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=TICKET  用ticket换取二维码图片
        show: mpBase + 'showqrcode?'
    },
    //长Url转短Url
    shortUrl: {
        create: base + 'shorturl?'
    },
    //获取ticket相关
    ticket: {
        create: base + 'ticket/getticket?'
    },
    //AI相关接口
    AI: {
        //接口文档——微信翻译http://api.weixin.qq.com/cgi-bin/media/voice/translatecontent?access_token=ACCESS_TOKEN&lfrom=xxx&lto=xxx
        translate: base + 'media/voice/translatecontent?'
    },
    //模板消息接口
    template: {
        // 设置所属行业 http请求方式: POST        https://api.weixin.qq.com/cgi-bin/template/api_set_industry?access_token=ACCESS_TOKEN
        set_industry: base + 'template/api_set_industry?',
        //获取设置的行业信息 http请求方式：GET     https://api.weixin.qq.com/cgi-bin/template/get_industry?access_token=ACCESS_TOKEN
        get_industry: base + 'template/get_industry?',
        //获得模板ID  http请求方式: POST         https://api.weixin.qq.com/cgi-bin/template/api_add_template?access_token=ACCESS_TOKEN
        api_add_template: base + 'template/api_add_template?',
        //获取模板列表  http请求方式：GET         https://api.weixin.qq.com/cgi-bin/template/get_all_private_template?access_token=ACCESS_TOKEN
        get_all_private_template: base + 'template/get_all_private_template?',
        //删除模板  http请求方式：POST           https://api.weixin.qq.com/cgi-bin/template/del_private_template?access_token=ACCESS_TOKEN
        del_private_template: base + 'template/del_private_template?',
        //发送模板消息  http请求方式: POST       https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=ACCESS_TOKEN
        message_send: base + 'message/template/send?'
    }
};

module.exports = class Wechat {
    constructor(options) {
        this.options = Object.assign({}, options);
        this.appID = options.appID;
        this.appSecret = options.appSecret;
        this.fetchDBAccessToken = options.searchAccessToken;
        this.saveDBAccessToken = options.saveAccessToken;
        this.updateDBAccessToken = options.updateAccessToken;
        this.saveDBTicket = options.saveTicket;
        this.updateDBTicket = options.updateTicket;
        this.fetchDBTicket = options.fetchTicket;

        this.getAccessToken();
    }

    /**
     * 封装用来请求接口的入口方法
     * @param operation 方法名
     * @param args 参数
     * @returns {Promise<*>}
     */
    async handle(operation, ...args) {
        const tokenData = await this.getAccessToken();
        const options = await this[operation](tokenData.access_token, ...args);
        return await this.request(options);
    };

    /**
     * 测试模板信息
     * @param token
     * @param openid
     * @returns {Promise<void>}
     */
    async templateMessageSend(token, openid) {
        const url = additionalUrl.template.message_send + 'access_token=' + token;
        const dataFromdatabase = await this.getAccessToken();
        const access_token = dataFromdatabase.access_token;
        console.log(access_token);
        const body = {
            touser: openid,
            template_id: "btJS4fj1Nj39JnVCFcnkx_HpOtAeEqXT-xWhYxWYCjI",

            // "url":"http://weixin.qq.com/download",
            // "miniprogram":{
            //     "appid":"xiaochengxuappid12345",
            //     "pagepath":"index?foo=bar"
            // },
            data: {
                first: {
                    value: "恭喜你测试成功！",
                    color: "#173177"
                },
                data: {
                    value: access_token,
                    color: "#173177"
                },
                remark: {
                    "value": "欢迎再次测试！",
                    "color": "#173177"
                }
            }
        };
        console.log(body);
        return {method: 'POST', url, body}
    }

    //https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET
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
     * 获取access_token
     * @returns {Promise<void>}
     */
    async getAccessToken() {
        let data = await this.fetchDBAccessToken();//从数据库查询得到的是一个数组[RowDataPacket{}]
        data = data[0];
        if (data === null || typeof (data) == "undefined") {
            data = await this.saveAccessToken();//保存access_token数据
        }
        // console.log('=========================', this.isValidToken(data));
        let flag = await this.isValidToken(data);//此处要用await，不然得到的是一个Promise对象，不能用来判断是否过期
        // console.log('flag:  ', flag);
        if (!flag) {
            // console.log('发现是过期的！');
            data = await this.updateAccessToken();//更新数据
        }
        return (data);
    }

    /**
     * 更新，主要是更新时间
     * @returns {Promise<*>}
     */
    async updateAccessToken() {
        console.log('更新access_token');
        const url = `${additionalUrl.accessToken}&appid=${this.appID}&secret=${this.appSecret}`;
        const data = await this.request({url});
        // console.log('in updateAccessToken 原 : ', data);
        const now = new Date().getTime();
        data.expires_in = now + (data.expires_in - 20) * 1000;

        this.updateDBAccessToken(data);//数据存入数据库

        // console.log('in updateAccessToken 后 : ', data);
        return data;
    };

    /**
     * 如果数据库中没有数据，则生成一个并保存
     * @returns {Promise<void>}
     */
    async saveAccessToken() {
        const url = `${additionalUrl.accessToken}&appid=${this.appID}&secret=${this.appSecret}`;
        const data = await this.request({url});
        // console.log('in saveAccessToken 原 : ', data);
        const now = new Date().getTime();
        data.expires_in = now + (data.expires_in - 20) * 1000;

        this.saveDBAccessToken(data);//数据存入数据库
        // console.log('in saveAccessToken 后 : ', data);
        return data;
    };

    /**
     * 检测票据的有效性
     * @param data
     * @returns {boolean}
     */
    async isValidToken(data) {
        // console.log('in isValid  :', data);
        if (!data || !data.expires_in) {
            return false;
        }
        return new Date().getTime() < data.expires_in;
    };

    /**
     * 更新ticket
     * @param token
     * @returns {Promise<void>}
     */
    async updateTicket(token) {
        const url = `${additionalUrl.ticket.create}access_token=${token}&type=jsapi`;
        const data = await this.request({url});
        const now = new Date().getTime();
        data.expires_in = now + (data.expires_in - 20) * 1000;
        this.updateDBTicket(data);//更新ticket
        return data;
    }

    /**
     * 如果数据库中没有数据，则生成一个并保存
     * @returns {Promise<void>}
     */
    async saveTicket(token) {
        const url = `${additionalUrl.ticket.create}access_token=${token}&type=jsapi`;
        const data = await this.request({url});
        // console.log('in saveAccessToken 原 : ', data);
        const now = new Date().getTime();
        data.expires_in = now + (data.expires_in - 20) * 1000;

        this.saveDBTicket(data);//数据存入数据库
        // console.log('in saveAccessToken 后 : ', data);
        return data;
    };

    /**
     * 获取Ticket数据
     * @returns {Promise<void>}
     */
    async getTicket(token) {
        // let tokenData;//获取token数据
        let data = await this.fetchDBTicket();//从数据库查询得到的是一个数组[RowDataPacket{}],不能直接在后面加[0]
        data = data[0];
        if (data === null || typeof (data) == "undefined") {
            // tokenData = await this.getAccessToken();//获取token数据
            data = await this.saveTicket(token);//保存access_token数据
        }
        // console.log('=========================', this.isValidToken(data));
        let flag = await this.isValidTicket(data);//此处要用await，不然得到的是一个Promise对象，不能用来判断是否过期
        // console.log('flag:  ', flag);
        if (!flag) {
            // console.log('发现是过期的！');
            // tokenData = await this.getAccessToken();//获取token数据
            data = await this.updateTicket(token);//更新数据
        }
        return (data);
    }

    /**
     * 检查ticket的有效性
     * @param ticket
     * @returns {Promise<boolean>}
     */
    async isValidTicket(ticket) {
        if (!ticket || !ticket.ticket || !ticket.expires_in) {
            return false;
        }
        return new Date().getTime() < ticket.expires_in;
    }

    /**
     * 上传素材，包含临时和永久素材
     * @param token
     * @param type 素材类型
     * @param material 数据，如果是图文的话是一个数组，而不是图文的话则是一个文件路径
     * @param permanent
     */
    uploadMaterial(token, type, material, permanent) {
        let form = {};
        let uploadUrl = additionalUrl.temporary.upload;
        //永久素材form是一个object，继承外面传入的新对象
        if (permanent) {//如果有permanent参数，说明是永久素材
            uploadUrl = additionalUrl.permanent.uploadMaterial;
            _.extend(form, permanent);//对form进行扩展
        }

        if (type === 'pic') {
            uploadUrl = additionalUrl.permanent.uploadNewsImg;
        }
        if (type === 'news') {//如果是图文
            uploadUrl = additionalUrl.permanent.uploadNews;
            form = material;//material是一个图文数据，是一个数组
        } else {
            form.media = fs.createReadStream(material);//此时material是一个文件路径(字符串)
        }

        let url = uploadUrl + 'access_token=' + token;
        if (!permanent) {//如果不是永久素材，则要增加type属性
            url += '&type=' + type;
        } else {
            form.access_token = data.access_token;//为form增加access_token参数
        }

        let options = {
            method: 'POST',
            url: url,
            json: true//以json格式上转
        };
        //数据类型不同，上传方式不同
        if (type === 'news') {//如果是图文
            options.body = form;
        } else {
            options.formData = form;//multipartData数据
        }
        return options
    };


    /**
     * 更新素材
     * @param token
     * @param mediaId
     * @param news
     * @returns {{method: string, body: (*|{media_id: *}), url: string}}
     */
    updateMaterial(token, mediaId, news) {
        let form = {media_id: mediaId};
        form = Object.assign(form, news);
        const url = `${additionalUrl.permanent.update}access_token=${token}&media_id=${mediaId}`;
        return {method: 'POST', url, body: form}
    }

    /**
     * 删除永久素材
     * @param token
     * @param mediaId 素材id
     * @returns {{method: string, body: {media_id: *}, url: string}}
     */
    deleteMaterial(token, mediaId) {
        const form = {media_id: mediaId};
        const url = `${additionalUrl.permanent.delete}access_token=${token}&media_id=${mediaId}`;
        return {method: 'POST', url, body: form};
    }

    /**
     * 获取素材总数
     * @param token
     * @returns {{method: string, url: string}}
     */
    countMaterial(token) {
        const url = `${additionalUrl.permanent.totalNumber}access_token=${token}`;
        return {method: 'GET', url}
    }

    /**
     * 获取素材列表
     * @param token
     * @param options
     * @returns {{method: string, body: *, url: string}}
     */
    batchMaterial(token, options) {
        options.type = options.type || 'image';//素材类型
        options.offset = options.offset || 0;//从第几个开始
        options.count = options.count || 10;//要取到多少个
        const url = `${additionalUrl.permanent.materialList}access_token=${token}`;
        return {method: 'POST', url, body: options}
    }

    /**
     * 获取素材
     * @param token
     * @param mediaId
     * @param type
     * @param permanent
     * @returns {*}
     */
    fetchMaterial(token, mediaId, type, permanent) {
        let form = {};
        let fetchUrl = additionalUrl.temporary.fetch;

        if (permanent) {
            fetchUrl = additionalUrl.permanent.fetch;
        }
        let url = fetchUrl + 'access_token=' + token;
        let options = {method: 'POST', url};
        if (permanent) {
            form.media_id = mediaId;
            form.access_token = token;
            options.body = form;
        } else {
            if (type === 'video') {
                url = url.replace('https:', 'http:');
            }
            url += '&media_id' + mediaId;
        }
        return options;
    }

    /**
     * 创建标签
     * @param token
     * @param name 标签名
     * @returns {{method: string, body: {tag: {name: *}}, url: string}}
     */
    createTag(token, name) {
        const body = {tag: {name}};
        const url = additionalUrl.tag.create + 'access_token=' + token;
        return {method: 'POST', url, body}
    }

    /**
     * 更新标签
     * @param token
     * @param id 标签id
     * @param name 新标签名
     * @returns {{method: string, body: {tag: {name: *, id: *}}, url: string}}
     */
    updateTag(token, id, name) {
        const body = {tag: {id, name}};
        const url = additionalUrl.tag.update + 'access_token=' + token;
        return {method: 'POST', url, body}
    }

    /**
     * 删除标签
     * @param token
     * @param id
     * @returns {{method: string, body: {tag: {id: *}}, url: string}}
     */
    delTag(token, id) {
        const body = {
            tag: {
                id: id
            }
        };
        let url = additionalUrl.tag.delete + 'access_token=' + token;
        return {method: 'POST', url, body};
    }

    /**
     * 获取标签下粉丝列表
     * @param token
     * @param id  //第一个拉取的OPENID，不填默认从头开始拉取
     * @param openId
     */
    fetchTagUsers(token, id, openId) {
        const body = {tagid: id, next_openid: openId || ''};
        let url = additionalUrl.tag.getFans + 'access_token=' + token;
        return {method: 'POST', url, body};
    }

    /**
     * 获取用户标签
     * @param token
     * @param openId
     * @returns {{method: string, body: {openid: *}, url: *}}
     */
    getUserTags(token, openId) {
        const body = {openid: openId};
        return {method: 'POST', url, body};
    }

    /**
     * 批量打或取消标签
     * @param token
     * @param unTag
     * @returns {{method: string, body: *, url: (string|*)}}
     */
    batchTagging(token, openIdList, Id, unTag) {
        const body = {openid_list: openIdList, tagid: Id};
        let url = !unTag ? additionalUrl.tag.batchTagging : additionalUrl.tag.batchUntagging;
        url += 'access_token=' + token;
        return {method: 'POST', url, body}
    }


    /**
     * 获取粉丝列表
     * @param token
     * @param openId
     * @returns {{url: string}}
     */
    fetchUserList(token, openId) {
        const url = additionalUrl.user.getUserList + 'access_token=' + token + '&next_openid=' + (openId || '');
        return {url}
    }

    /**
     * 设置用户备注名
     * @param token
     * @param openId 用户id
     * @param remark 备注名
     * @returns {{method: string, body: {openid: *, remark: *}, url: string}}
     */
    remarkUser(token, openId, remark) {
        const body = {
            openid: openId,
            remark: remark
        };
        const url = additionalUrl.user.remark + 'access_token=' + token;
        return {method: 'POST', url, body};
    }

    /**
     * 获取用户信息
     * @param token
     * @param openId
     * @param lan
     * @returns {string}
     */
    getUserInfo(token, openId, lan = 'zh_CN') {
        return additionalUrl.user.info + 'access_token=' + token + '&openid=' + openId + '&lang=' + lan;
    }

    /**
     * 批量获取用户信息
     * @param token
     * @param openIdList
     * @returns {{method: string, body: {user_list: *}, url: string}}
     */
    fetchBatchUsers(token, openIdList) {
        const body = {user_list: openIdList};
        const url = additionalUrl.user.batchInfo + 'access_token=' + token;
        return {method: 'POST', url, body}
    }


    /**
     * 创建二维码Ticket
     * @param token
     * @param qr
     */
    createQrcode(token, qr) {
        const url = additionalUrl.qrcode.create + 'access_token=' + token;
        return {method: 'POST', url, body: qr};
    }

    /**
     *通过ticket换取二维码
     * @param ticket
     */
    showQrcode(ticket) {
        return additionalUrl.qrcode.show + 'ticket=' + encodeURI(ticket);
    }

    /**
     * 长url转段url
     * @param token
     * @param action 一般为long2short
     * @param longUrl
     * @returns {{method: string, body: {action: *, long_url: *}, url: string}}
     */
    createShortUrl(token, action, longUrl) {
        const url = additionalUrl.shortUrl.create + 'access_token=' + token;
        const body = {
            action,
            long_url: longUrl
        };
        return {method: 'POST', url, body};
    };

    /**
     * 语义理解
     * @param token
     * @param semanticData Object
     * @returns {{method: string, body: {action: *, long_url: *}, url: string}}
     */
    semantic(token, semanticData) {
        const url = additionalUrl.semantic + 'access_token=' + token;
        semanticData.appid = this.appID;
        return {method: 'POST', url, body: semanticData};
    }

    /**
     * AI接口文档——微信翻译
     * @param token
     * @param body 内容
     * @param lform 源语言，zh_CN 或 en_US
     * @param lto 目标语言，zh_CN 或 en_US
     */
    aiTranslate(token, body, lform, lto) {
        const url = additionalUrl.semantic + 'access_token=' + token + '&lfrom=' + lform + '&lto=' + lto;
        return {method: 'POST', url, body};
    }

    /**
     * 自定义菜单创建
     * @param token
     * @param menu
     * @param rules 个性化菜单,匹配规则"matchrule":{
                                                  "tag_id":"2",
                                                  "sex":"1",
                                                  "country":"中国",
                                                  "province":"广东",
                                                  "city":"广州",
                                                  "client_platform_type":"2",
                                                  "language":"zh_CN"
                                                  }
     * @returns {{method: string, body: *, url: string}}
     */
    createMenu(token, menu, rules) {
        let url = additionalUrl.menu.create + 'access_token=' + token;
        if (rules) {
            url = additionalUrl.menu.custom + 'access_token=' + token;
            menu.matchrule = rules;
        }
        return {method: 'POST', url, body: menu}
    }

    /**
     * 删除自定义菜单
     * @param token
     * @returns {{method: string, url: string}}
     */
    deleteMenu(token) {
        const url = additionalUrl.menu.delete + 'access_token=' + token;
        return {method: 'GET', url}//GET请求可以不用指明，默认就是
    }

    /**
     * 自定义菜单查询
     * @param token
     * @returns {{url: string}}
     */
    getMenu(token) {
        const url = additionalUrl.menu.get + 'access_token=' + token;
        return {url};
    }

    xxx(type, form, uploadUrl) {
        const options = {
            method: 'POST',
            url: uploadUrl,
            json: true
        };

        //图文和非图文在request提交主体判断
        if (type === 'news') {
            options.body = form;
        } else {
            options.formData = form;
        }
        console.log(options);
        return options;
    }
};