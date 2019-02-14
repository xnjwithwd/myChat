exports.reply = async (ctx, next) => {
    let wechat_config = require('../wechat/index');
    let client = wechat_config.getWechat();
    console.log('in reply   ');
    let message = ctx.weixin;//获取到挂载到ctx中的信息
    console.log('message: ', message);
    if (message.MsgType === 'event') {
        if (message.Event === 'subscribe') {//订阅
            if (message.EventKey) {
                console.log('通过扫二维码进来：' + message.EventKey + '  ' + message.Ticket);
            }
            this.body = '您好，很高兴与您相遇！';
            console.log('有人关注！');
        } else if (message.Event === 'unsubscribe') {//取消订阅
            this.body = '希望还能再见！';//用户是收不到的
            console.log('无情取关！');
        } else if (message.Event === 'LOCATION') {//上报地理位置事件
            this.body = '您的位置是： ' + message.Latitude + '/' + message.Longitude + '-' + message.Precision;
        } else if (message.Event === 'CLICK') {//自定义菜单事件
            this.body = '您点击了菜单！' + message.EventKey;
        } else if (message.Event === 'SCAN') {//扫描带参数二维码事件
            console.log('关注后扫二维码' + message.EventKey + '  ' + message.Ticket);
            this.body = '看到您扫了一下哦！';
        } else if (message.Event === 'VIEW') {
            this.body = '您点击了菜单中的连接！' + message.EventKey;//此时的EventKey就是URL地址
        } else if (message.Event === 'scancode_push') {
            console.log(message.ScanCodeInfo.ScanType);
            console.log(message.ScanCodeInfo.ScanResult);
            this.body = '您点击了菜单中的连接！' + message.EventKey;//此时的EventKey就是URL地址
        } else if (message.Event === 'scancode_waitmsg') {
            console.log(message.ScanCodeInfo.ScanType);
            console.log(message.ScanCodeInfo.ScanResult);
            this.body = '您点击了菜单中的连接！' + message.EventKey;//此时的EventKey就是URL地址
        } else if (message.Event === 'pic_sysphoto') {
            console.log(message.SendPicsInfo.PicList);
            console.log(message.SendPicsInfo.Count);
            this.body = '您点击了菜单中的连接！' + message.EventKey;//此时的EventKey就是URL地址
        } else if (message.Event === 'pic_photo_or_album') {
            console.log(message.SendPicsInfo.PicList);
            console.log(message.SendPicsInfo.Count);
            this.body = '您点击了菜单中的连接！' + message.EventKey;//此时的EventKey就是URL地址
        } else if (message.Event === 'pic_weixin') {
            console.log(message.SendPicsInfo.PicList);
            console.log(message.SendPicsInfo.Count);
            this.body = '您点击了菜单中的连接！' + message.EventKey;//此时的EventKey就是URL地址
        } else if (message.Event === 'location_select') {//弹出地理位置选择器的事件推送
            console.log(message.SendLocationInfo.Location_X);
            console.log(message.SendLocationInfo.Location_Y);
            console.log(message.SendLocationInfo.Scale);
            console.log(message.SendLocationInfo.Label);
            console.log(message.SendLocationInfo.Poiname);
            this.body = '您点击了菜单中的连接！' + message.EventKey;//此时的EventKey就是URL地址
        }
    } else if (message.MsgType === 'text') {//如果收到了文本信息，根据不同的数据进行回复
        let content = message.Content;
        let reply = '您说的是：' + content + ' ，对不想我们没有相关服务！';
        if (content === '1') {
            reply = '天下第一';
        } else if (content === '2') {
            reply = '天下第二';
        } else if (content === '3') {
            reply = '天下第三';
        } else if (content === '4') {
            reply = [{
                title: '技术改变世界',
                description: '这是一个描述',
                picUrl: 'http://www.zyzw.com/sjms/sjmst/sjmsdg001.jpg',
                url: 'https://www.jianshu.com/p/f96b9169eec4'
            }];
        } else if (content === '5') {
            await client.handle('templateMessageSend', message.FromUserName);
        }
        ctx.body = reply;
    }
    await next();
};