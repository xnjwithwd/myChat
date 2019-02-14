/*
1.实现一个注册页面的控制器 showSignup
2.增加一个登录页面的控制器 showLogin
3.用户数据的持久化 signup
4.增加一个登录的校验/判断 signin
5.增加路由规则
6.增加两个Pug页面、注册和登录
7.koa-bodyparser
 */

const User = require('../../database/user');
const userTool = new User();

//实现一个注册页面的控制器
exports.showSignup = async (ctx, next) => {
    await ctx.render('pages/signup');
};

//增加一个登录页面的控制器
exports.showSignin = async (ctx, next) => {
    await ctx.render('pages/signin');
};

//用户数据的持久化
exports.signup = async (ctx, next) => {
    const {email, password, nickname} = ctx.request.body.user;

    let user = userTool.handle('getUserByEmail',email);//如果用户已有了

    if (user) {
        return ctx.redirect('signin');//如果有用户了，跳入登录页面
    } else {
        //保存session
        ctx.session.user ={
            _id:user._id,
            nickname:user.nickname
        };
        let loginAttempts = 0;
        await userTool.handle('saveUser',{email,password,nickname,loginAttempts});
        ctx.redirect('/');//跳到主页面
    }
};

/**
 * 增加一个登录的校验/判断 signin
 * @param ctx
 * @param next
 * @returns {Promise<*|Router|void|never|Response>}
 */
exports.signin = async (ctx, next) => {
    const {
        email,
        password,
        nickname
    } = ctx.request.body.user;

    let user = userTool.getUserByEmail(email);

    //没有找到用户，跳到注册页面
    if (!user) return ctx.redirect('/signup');

    let flag = await userTool.login(nickname, password);

    if (flag) {//密码正确
        ctx.session.user = {_id: user._id, nickname: user.nickname};
        return ctx.redirect('/')
    } else {
        return ctx.redirect('/signin')//定向到登录
    }
};

/**
 * 用户登出
 * @param ctx
 * @param next
 * @returns {Promise<void>}
 */
exports.logout = async (ctx, next) => {
    ctx.session.user = {};
    ctx.redirect('/');
};

//增加路由规则
