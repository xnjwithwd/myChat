const mysql = require('mysql');
const crypto = require('crypto');
const config = require('../config/config');
const pool = mysql.createPool(config.database);
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 20 * 60 * 1000;

module.exports = class User {
    constructor(config) {
        this.constructor = Object.assign({}, config);
    };

    /**
     * 封装接口方法
     * @param operation 方法名
     * @param args 参数
     * @returns {Promise<void>}
     */
    async handle(operation, ...args) {
        return await this[operation](...args);
    }

    /**
     * 保存用户信息
     * @param data
     * @returns {Promise<void>}
     */
    async saveUser(data) {
        // let role = data.role;//角色user/admin
        // let openid = data.openId;
        // let unionid = data.unionid;
        // let nickname = data.nickname;
        // let address = data.address;
        // let province = data.province;
        // let country = data.country;
        // let city = data.city;
        // let gender = data.gender;
        // let email = data.email;
        // let password = data.password;
        // let loginAttempts = data.loginAttempts;
        // let lockUntil = new Date().getTime() + 15 * 60 * 1000;
        let createdAt = new Date().getTime();
        let updateAt = new Date().getTime();
        let sql = `INSERT INTO user (role,openid,unionid,nickname,address,country,province,city,gender,email,password,loginAttempts,lockUntil,createdAt,updateAt) 
                               value ('${data.role}','${data.openid}','${data.unionid}','${data.nickname}','${data.address}','${data.country}','${data.province}','${data.city}','${data.gender}','${data.email}','${data.password}','${data.loginAttempts}','${data.lockUntil}','${createdAt}','${updateAt}')`;
        pool.query(sql, (err) => {
            if (err) console.error('saveUser fails！');
        })
    }

    /**
     * 删除用户信息
     * @param id
     * @returns {Promise<void>}
     */
    async deleteUser(id) {
        let sql = 'delete from user where ID=${id}';
        pool.query(sql, (err) => {
            if (err) console.error('deleteUser fails!');
        })
    }

    /**
     * 保存用户信息
     * @param userData
     * @returns {Promise<void>}
     */
    async updateUser(userData) {
        let updateAt = new Date().getTime();
        let sql = `update user set role='${userData.role}',openid='${userData.openid}',unionid='${userData.unionid}',nickname='${userData.nickname}',address='${userData.address}',country='${userData.country}',province='${userData.province}',city='${userData.city}',gender='${userData.gender}',email='${userData.email}',password='${userData.password}',loginAttempts='${userData.loginAttempts}',lockUntil='${userData.lockUntil}',createdAt='${userData.createdAt}',updateAt='${updateAt}'`;
        pool.query(sql, (err) => {
            if (err) console.error('updateUser fails!');
        })
    }

    /**
     * 查询用户
     * @param email
     * @returns {Promise<*>}
     */
    async getUserByEmail(email) {
        let sql = `select * from user where nickname='${email}'`;
        return new Promise(function (resolve, reject) {
            pool.query(sql, (err, data) => {
                if (err) reject('getUserByEmail fails!');
                else resolve(data);
            })
        })
    }

    /**
     * 密码不对，加1
     * @param userDate
     * @returns {Promise<void>}
     */
    async attemptyPlus(userDate) {
        let sql = `update user set loginAttempts=loginAttempts + 1 where ID='${userDate.ID}'`;
        pool.query(sql, (err) => {
            if (err) console.error('attemptyPlus fails!');
        })
    }

    /**
     * 设定锁定用户时间
     * @param userData
     * @returns {Promise<void>}
     */
    async lock(userData) {
        let lockTime = new Date().getTime();
        let sql = `update user set lockUntil='${lockTime}' where ID='${userData.ID}'`;
        pool.query(sql, (err) => {
            if (err) console.error('lock user fails!');
        })
    }

    /**
     * 加密
     * @param password
     * @returns {Promise<string>}
     */
    async crypto(password) {
        let cry = crypto.createHash('md5');
        cry.update(config.MD5_SUFFIX + password);
        return cry.digest('hex');
    }

    /**
     * 登陆方法
     * @param userName
     * @param password
     * @returns {Promise<boolean>}
     */
    async login(userName, password) {
        const userGet = await this.getUserByUserName(userName);
        if (userGet.lockUntil > new Date().getTime()) {//判断是否还在锁定期
            return false;
        }
        if (userGet.loginAttempts == MAX_LOGIN_ATTEMPTS) {
            await this.lock(userGet);//设定锁定用户时间
            return false;
        }
        if (userGet.password !== crypto(password)) {
            await this.attemptyPlus(userGet);//错误计数加1
            return false;
        }
        return true;
    }
};
