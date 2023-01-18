import crypto from "crypto";
import { requestPromise } from "./utils/req.js";
import {ddBotNotify} from "./utils/sendNotify.js";


let pushMsg = []
const md5Crypto = (md5str) => {
    const hash = crypto.createHash('md5')
    hash.update(md5str)

    const md5strnew = hash.digest('hex')
    return md5strnew;
}

const delay = async (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms))
}
const get_token = async (cookie) => {
    const options = {
        url: 'https://user-api.smzdm.com/robot/token',
        headers: {
            'Host': 'user-api.smzdm.com',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': cookie,
            'User-Agent': 'smzdm_android_V10.4.1 rv:841 (22021211RC;Android12;zh)smzdmapp',
        },
        body: {
            "f": "android",
            "v": "10.4.1",
            "weixin": 1,
            "time": Date.now(),
            "sign": md5Crypto(`f=android&time=${Date.now()}&v=10.4.1&weixin=1&key=apr1$AwP!wRRT$gJ/q.X24poeBInlUJC`).toUpperCase()
        },
        method: 'POST'
    }

    return await requestPromise(options);

}

const run_Checkin = async (cookie, token) => {
    const options = {
        url: 'https://user-api.smzdm.com/checkin',
        headers: {
            'Host': 'user-api.smzdm.com',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': cookie,
            'User-Agent': 'smzdm_android_V10.4.1 rv:841 (22021211RC;Android12;zh)smzdmapp',
        },
        body: {
            "f": "android",
            "v": "10.4.1",
            "sk": "ierkM0OZZbsuBKLoAgQ6OJneLMXBQXmzX+LXkNTuKch8Ui2jGlahuFyWIzBiDq/L",
            "weixin": 1,
            "time": Date.now(),
            "token": token,
            "sign": md5Crypto(`f=android&sk=ierkM0OZZbsuBKLoAgQ6OJneLMXBQXmzX+LXkNTuKch8Ui2jGlahuFyWIzBiDq/L&time=${Date.now()}&token=${token}&v=10.4.1&weixin=1&key=apr1$AwP!wRRT$gJ/q.X24poeBInlUJC`).toUpperCase()
        },
        method: 'POST'
    }
    try {
        const res1 = await requestPromise(options);
        console.log(res1.data.error_msg);
        pushMsg.push(res1.data.error_msg)
    } catch (e) {
        console.log(e)
    }
    await delay(1000)
    try {
        options.url = `https://user-api.smzdm.com/checkin/all_reward`
        const res2 = await requestPromise(options);
        console.log(res2.data.error_code === '0' ? res2.data.data.normal_reward.sub_title : res2.data.error_msg);
        pushMsg.push(res2.data.error_code === '0' ? res2.data.data.normal_reward.sub_title : res2.data.error_msg)
    } catch (e) {
        console.log(e)
    }

}

const lottery = async (cookie, active_id) => {
    const options = {
        url: `https://zhiyou.smzdm.com/user/lottery/jsonp_draw?active_id=${active_id}`,
        headers: {
            'Host': 'zhiyou.smzdm.com',
            'Accept': '*/*',
            'Connection': 'keep-alive',
            'Cookie': cookie,
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148/smzdm 10.4.6 rv:130.1 (iPhone 13; iOS 15.6; zh_CN)/iphone_smzdmapp/10.4.6/wkwebview/jsbv_1.0.0',
            'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
            'Referer': 'https://m.smzdm.com/',
            'Accept-Encoding': 'gzip, deflate, br'
        },
        method: 'GET',
    }
    try {
        const res = await requestPromise(options);
        console.log(res.data.error_msg);
        pushMsg.push(res.data.error_msg)
        // console.log(res.data);
    }
    catch (e) {
        console.log(e)
    }

    await delay(10000)
    try {
        options.url = `https://zhiyou.smzdm.com/user/lottery/jsonp_get_active_info?active_id=${active_id}`
        const res = await requestPromise(options);
        console.log(res.data.error_msg);
        pushMsg.push(res.data.error_msg)
        // console.log(res.data);
    }
    catch (e) {
        console.log(e)
    }

}

const get_userinfo = async (cookie) => {
    const options = {
        url: `https://zhiyou.smzdm.com/user/`,
        headers: {
            'Host': 'zhiyou.smzdm.com',
            'Accept': '*/*',
            'Connection': 'keep-alive',
            'Cookie': cookie,
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148/smzdm 10.4.6 rv:130.1 (iPhone 13; iOS 15.6; zh_CN)/iphone_smzdmapp/10.4.6/wkwebview/jsbv_1.0.0',
            'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
            'Referer': 'https://m.smzdm.com/',
            'Accept-Encoding': 'gzip, deflate, br'
        },
        method: 'GET',
    }
    const res = await requestPromise(options);
    try {
        const name = res.data.match(/<a href="https:\/\/zhiyou.smzdm.com\/user"> (.*?) <\/a>/)[1]
        const level = res.data.match(/<img src="https:\/\/res.smzdm.com\/h5\/h5_user\/dist\/assets\/level\/(.*?)\.png\?v=1">/)[1]
        const gold = res.data.match(/<div class="assets-part assets-gold">\n                    (.*?)<\/span>/)[1].replace('<span class="assets-part-element assets-num">', '')
        const silver = res.data.match(/<div class="assets-part assets-prestige">\n                    (.*?)<\/span>/)[1].replace('<span class="assets-part-element assets-num">', '')
        // console.log(`帐号: ${name} \nVIP:${level}\n剩余碎银:${silver} \n剩余金币:${gold}`);
        pushMsg.push(`帐号: ${name} \nVIP:${level}\n剩余碎银:${silver} \n剩余金币:${gold}`);
    } catch (e) {
        console.log(e);
    }

}

// get_userinfo(cookie)
const smzdm = async (cookie) => {

// (async () => {

    const token_res = await get_token(cookie);
    if (token_res.data.error_code === '0') {
        await run_Checkin(cookie, token_res.data.data.token);

    } else {
        console.log(token_res.data.error_msg);
    }
    await delay(1000)
    const active_id = ['ljX8qVlEA7', 'xbe1nmxEqw']
    for (let i = 0; i < active_id.length; i++) {
        await lottery(cookie, active_id[i]);
        await delay(5000)

    }
    await delay(1000)
    await get_userinfo(cookie)

    console.log(pushMsg.join(`\n`));

    await ddBotNotify(pushMsg.join(`\n`));
// })();
}
export default smzdm

