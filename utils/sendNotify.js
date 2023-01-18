import crypto from "crypto";
import { requestPromise } from "./req.js";
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()

const  DD_BOT_TOKEN = process.env.DD_BOT_TOKEN || '';
const  DD_BOT_SECRET = process.env.DD_BOT_SECRET || '';

export const ddBotNotify = async (desp) => {
    const options = {
        url: `https://oapi.dingtalk.com/robot/send?access_token=${DD_BOT_TOKEN}`,
        body: {
            "msgtype": "text",
            "text": {
                "content": desp
            },
        },
        headers: {
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_4_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 iqiyiVersion/11.4.5",
        },
        method: 'POST',

    }

    if (DD_BOT_TOKEN && DD_BOT_SECRET) {
        const dateNow = Date.now();
        const hmac = crypto.createHmac('sha256', DD_BOT_SECRET);
        hmac.update(`${dateNow}\n${DD_BOT_SECRET}`);
        const result = encodeURIComponent(hmac.digest('base64'));
        options.url = `${options.url}&timestamp=${dateNow}&sign=${result}`;
        const res = await requestPromise(options);
        try {
            return res.data.errcode === 0 ? `钉钉通知发送成功` : `钉钉通知发送失败`
        } catch (e) {
            return `${e.message || e} ‼️`;
        }
    } else if (DD_BOT_TOKEN) {
        const res = await requestPromise(options);
        try {
            return res.data.errcode === 0 ? `钉钉通知发送成功` : `钉钉通知发送失败`
        } catch (e) {
            return `${e.message || e} ‼️`;
        }
    } else {
        return `DD_BOT_TOKEN 未提供 ‼️`;
    }

}


