const Wechat = require('../wechat-lib/index');
const WechatOAth = require('../wechat-lib/oauth');
const config = require('../config/config');
const mysql = require('mysql');
const pool = mysql.createPool(config.database);

const wechatConfig ={
    wechat:{
        appID:config.wechat.appID,
        appSecret:config.wechat.appsecret,
        token:config.wechat.token,
        /**
         *
         * @returns {Promise<void>}
         */
        async searchAccessToken(){
            const sql = `select * from access_token where ID=1`;
            return new  Promise(function (resolve,reject) {
                pool.query(sql,(err,data)=>{
                    if(err) reject(err);
                    resolve(data);
                })
            })
        },

        async saveAccessToken(token){
            const sql = `insert into access_token (access_token,expries_in) value ('${token.access_token}','${token.expires_in}')`;
            pool.query(sql,(err)=>{
                if(err) console.error('saveAccessToken to database fails!');
            })
        },

        async updateAccessToken(token){
            const sql = `update access_token set access_token='${token.access_token}',expires_in='${token.expires_in}' where ID=1`;
            console.log('sql: ',sql);
            pool.query(sql,(err)=>{
                if(err) console.error('updateAccessToken to database fails!',err);
            })
        }
    }
};

exports.getWechat = ()=> new Wechat(wechatConfig.wechat);
exports.getOAuth = ()=> new WechatOAth(wechatConfig.wechat);