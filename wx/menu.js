'use strict';

/**
 * 所有的type值都是官方设定好的
 * @type {{button: *[]}}
 */
module.exports = {
    'button': [{
        'name': '点击事件',
        'type': 'click',
        'key': 'menu_click'//其中的key就是点击后传到后台的值
    }, {
        'name': '点击菜单',
        'sub_button': [{
            'name': '跳转URL',
            'type': 'view',
            'url': 'http://github.com/'
        }, {
            'name': '扫码推送事件',
            'type': 'scancode_push',
            'key': 'qr_scan'
        }, {
            'name': '扫码推送',
            'type': 'scancode_waitmsg',
            'key': 'qu_scan_wait'
        }, {
            'name': '系统拍照',
            'type': 'pic_sysphoto',
            'key': 'pic_photo'
        }, {
            'name': '弹出拍照或相册',
            'type': 'pic_photo_or_album',
            'key': 'pic_photo_album'
        },]
    }, {
        'name': '菜单2',
        'sub_button': [{
            'name': '弹出微信相册发图',
            'type': 'pic_weixin',
            'key': 'pic_weixin'
        }, {
            'name': '地理位置选择',
            'type': 'location_select',
            'key': 'location_select'
        }
            // ,{
            //     'name': '下发消息',
            //     'type': 'media_id',
            //     'media_id': 'xxx'
            // },{
            //     'name': '跳转图文消息URL',
            //     'type': 'view_limited',
            //     'media_id': 'xxx'
            // }
        ]
    }]
};