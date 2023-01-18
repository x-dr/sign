import crypto from "crypto";
import { requestPromise } from "./utils/req.js";
import {ddBotNotify} from "./utils/sendNotify.js";



let pushMsg = [];

let P00001 = '';

let P00003 = '';

let dfp = '';



const md5Crypto = (md5str) => {
    const hash = crypto.createHash('md5')
    hash.update(md5str)

    const md5strnew = hash.digest('hex')
    return md5strnew;
}
const time = () => {
    const end = ((Date.now() - start) / 1000).toFixed(2)
    return console.log('\n签到用时: ' + end + ' 秒')
}

const delay = async (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms))
}
const k = (...argv) => {
    const e = argv.length > 0 && void 0 !== argv[0] ? argv[0] : ""
    const t = argv.length > 1 && void 0 !== argv[1] ? argv[1] : {}
    const a = argv.length > 2 && void 0 !== argv[2] ? argv[2] : {}
        , n = a.split
        , c = void 0 === n ? "|" : n
        , r = a.sort
        , s = void 0 === r || r
        , o = a.splitSecretKey
        , i = void 0 !== o && o
        , l = s ? Object.keys(t).sort() : Object.keys(t)
        , u = l.map((function (e) {
            return "".concat(e, "=").concat(t[e])
        }
        )).join(c) + (i ? c : "") + e;
    return md5Crypto(u)
}

const w = (...argv) => {
    var e = argv.length > 0 && void 0 !== argv[0] ? argv[0] : {}
        , t = [];
    return Object.keys(e).forEach((function (a) {
        t.push("".concat(a, "=").concat(e[a]))
    }
    )),
        t.join("&")
}


const stringRandom = (length) => {
    var rdm62, ret = '';
    while (length--) {
        rdm62 = 0 | Math.random() * 62;
        ret += String.fromCharCode(rdm62 + (rdm62 < 10 ? 48 : rdm62 < 36 ? 55 : 61))
    }
    return ret;
};



const Checkin = async () => {
    const timestamp = new Date().getTime();
    const sign_date = {
        agentType: "1",
        agentversion: "1.0",
        appKey: "basic_pcw",
        authCookie: P00001,
        qyid: md5Crypto(stringRandom(16)),
        task_code: "natural_month_sign",
        timestamp: timestamp,
        typeCode: "point",
        userId: P00003,
    };
    const post_date = {
        "natural_month_sign": {
            "agentType": "1",
            "agentversion": "1",
            "authCookie": P00001,
            "qyid": md5Crypto(stringRandom(16)),
            "taskCode": "iQIYI_mofhr",
            "verticalCode": "iQIYI"
        }
    };
    const sign = k("UKobMjDMsDoScuWOfp6F", sign_date, {
        split: "|",
        sort: !0,
        splitSecretKey: !0
    });
    // console.log(sign);
    const res = await requestPromise({
        url: `https://community.iqiyi.com/openApi/task/execute?${w(sign_date)}&sign=${sign}`,
        headers: {
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_4_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 iqiyiVersion/11.4.5",
        },
        body: post_date,
        method: 'POST',
    })
    let CheckinMsg, rewards = [], CheckinMsgarr = [];
    try {
        // if (error) throw new Error(`接口请求出错 ‼️`);
        if (res.data.code === "A00000") {
            if (res.data.data.code === "A0000") {
                for (let i = 0; i < res.data.data.data.rewards.length; i++) {
                    if (res.data.data.data.rewards[i].rewardType == 1) {
                        rewards.push(`成长值+${res.data.data.data.rewards[i].rewardCount}`)
                    } else if (res.data.data.data.rewards[i].rewardType == 2) {
                        rewards.push(`VIP天+${res.data.data.data.rewards[i].rewardCount}`)
                    } else if (res.data.data.data.rewards[i].rewardType == 3) {
                        rewards.push(`积分+${res.data.data.data.rewards[i].rewardCount}`)
                    }
                }
                var continued = res.data.data.data.signDays;

                CheckinMsg = `应用签到: ${rewards.join(", ")}${rewards.length < 3 ? `, 累计签到${continued}天` : ``} 🎉`;
            } else {
                CheckinMsg = `应用签到: ${res.data.data.msg} ⚠️`;
            }
        } else {
            CheckinMsg = `应用签到: Cookie无效 ⚠️`;
        }

    } catch (e) {
        console.log(e)
        CheckinMsg = `应用签到: ${e.message || e}`;
    }
    pushMsg.push(CheckinMsg);
    console.log(CheckinMsg);
    // return CheckinMsgarr;

}


const get_userinfo = async () => {
    const timestamp = new Date().getTime();
    const res = await requestPromise({
        url: `https://tc.vip.iqiyi.com/growthAgency/v2/growth-aggregation?messageId=${md5Crypto(stringRandom(16))}&platform=97ae2982356f69d8&P00001=${P00001}&responseNodes=duration%2Cgrowth%2Cupgrade%2CviewTime%2CgrowthAnnualCard&_=${timestamp}`,
        headers: {
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_4_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 iqiyiVersion/11.4.5",
        },
        method: 'GET'
    })
    let msg;
    try {
        if (res.data.code === 'A00000') {
            const growth = res.data.data.growth
            msg = `爱奇艺-用户信息\n到期时间:${growth.deadline}\n当前等级为: ${growth.level}\n今日获得成长值: ${growth.todayGrowthValue}\n总成长值: ${growth.growthvalue}\n距离下一等级还差${growth.distance}成长值`
            console.log(msg);
        } else {
            console.log(res.data.msg)
        }

    } catch (e) {
        console.log(e)
    }
    // console.log(msg);
    pushMsg.push(msg);
}




const getUid = async () => {
    const res = await requestPromise({
        url: `https://passport.iqiyi.com/apis/user/info.action?authcookie=${P00001}&fields=userinfo%2Cqiyi_vip&timeout=15000`,
        headers: {
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_4_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 iqiyiVersion/11.4.5",
        },
        method: 'GET',
    })
    try {
        if (res.data.code === 'A00000') {
            // console.log(res.data);
            // console.log(res.data.data.userinfo.pru)
            return res.data.data.userinfo.pru
        } else {
            console.log("爱奇艺每日任务: 请求api失败 最大可能是cookie失效了 也可能是网络问题")
        }
    } catch (e) {
        console.log(e)
    }

}

const lottery_draw = async (s) => {
    const timestamp = new Date().getTime();
    const uid = await getUid()
    // console.log("1",uid);
    const res = await requestPromise({
        url: `https://iface2.iqiyi.com/aggregate/3.0/lottery_activity?app_k=0&app_v=0&platform_id=10&dev_os=2.0.0&dev_ua=0&net_sts=0&qyid=${md5Crypto(stringRandom(16))}&psp_uid=${uid}&psp_cki=${P00001}&psp_status=3&secure_p=0&secure_v=1&req_sn=${timestamp}`,
        headers: {
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_4_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 iqiyiVersion/11.4.5",
        },
        method: 'GET',
    })
    let LotteryMsg
    try {
        const Lotterylast = res.data.kv.code === 'Q00702' ? true : false
        if (res.data.code === 0 && res.data.awardName) {
            // console.log(res.data);
            LotteryMsg = `应用抽奖: ${!Lotterylast ? `${res.data.awardName.replace(/《.+》/, "未中奖")} 🎉` : `您的抽奖次数已经用完 ⚠️`}`
            console.log(LotteryMsg)
        } else if (res.data.hasOwnProperty("errorReason")) {
            LotteryMsg = `应用抽奖: ${res.data.errorReason || `未知错误`} ⚠️`
            console.log(LotteryMsg)

        } else {
            LotteryMsg = `应用抽奖: ${res.data}`
            console.log(LotteryMsg);
        }
        pushMsg.push(LotteryMsg)
        return Lotterylast
    } catch (e) {
        console.log(e)
    }
    // console.log(res.data);
    console.log(LotteryMsg);


}




const getTaskList = async () => {
    let taskListMsg, taskList = [];
    const res = await requestPromise({
        url: `https://tc.vip.iqiyi.com/taskCenter/task/queryUserTask?P00001=${P00001}`,
        headers: {
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_4_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 iqiyiVersion/11.4.5",
        },
        method: 'GET',
    })
    try {
        if (res.data.code === 'A00000' && res.data.data && res.data.data.tasks) {
            Object.keys(res.data.data.tasks).map((group) => {
                (res.data.data.tasks[group] || []).map((item) => {
                    // console.log(item);
                    taskList.push({
                        name: item.taskTitle,
                        taskCode: item.taskCode,
                        status: item.status
                    })
                })
            })
            taskListMsg = `获取成功!`;
        } else {
            taskListMsg = `获取失败!`;

        }
    } catch (e) {
        taskListMsg = `${e.message || e} ‼️`;
    }
    // console.log(`爱奇艺-任务列表: ${taskListMsg}\n`)
    // console.log(taskList);
    return taskList

}


const joinTask = async (task) => {
    let joinTaskMsg;
    const res = await requestPromise({
        url: `https://tc.vip.iqiyi.com/taskCenter/task/joinTask?P00001=${P00001}&taskCode=${task.taskCode}&platform=b6c13e26323c537d&lang=zh_CN&app_lm=cn`,
        // url: `https://tc.vip.iqiyi.com/taskCenter/task/joinTask?P00001=${P00001}&taskCode=${taskCode}`,
        headers: {
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_4_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 iqiyiVersion/11.4.5",
        },
        method: 'GET',
    })
    try {
        joinTaskMsg = res.data.msg
    } catch (e) {
        joinTaskMsg = `${e.message || e} ‼️`;
    }
    // console.log(`爱奇艺-加入任务: ${joinTaskMsg}\n`)
    // return joinTaskMsg

    // console.log(res.data);
    console.log(`爱奇艺-领取任务: ${task.name} => ${joinTaskMsg}`)

}

const notifyTask = async (task) => {
    const timestamp = new Date().getTime();
    const res2 = await requestPromise({
        url: `https://tc.vip.iqiyi.com/taskCenter/task/notify?taskCode=${task.taskCode}&P00001=${P00001}&platform=97ae2982356f69d8&lang=cn&bizSource=component_browse_timing_tasks&_=${timestamp}`,
        headers: {
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_4_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 iqiyiVersion/11.4.5",
        },
        method: 'GET',
    })
    // console.log(res2.data);
    let notifyTaskMsg;
    try {
        notifyTaskMsg = res2.data.code === 'A00000' ? `完成任务成功` : `完成任务失败`
    } catch (e) {
        notifyTaskMsg = `${e.message || e} ‼️`;
    }

    // console.log(notifyTaskMsg);
    console.log(`爱奇艺-开始任务: ${task.name} => ${notifyTaskMsg} `)
    // return notifyTaskMsg
}
//0：待领取 1：已完成 2：未开始 4：进行中



const getTaskRewards = async (task) => {
    let getTaskRewardsMsg;
    const res3 = await requestPromise({
        url: `https://tc.vip.iqiyi.com/taskCenter/task/getTaskRewards?P00001=${P00001}&taskCode=${task.taskCode}&lang=zh_CN&platform=b2f2d9af351b8603`,
        headers: {
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_4_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 iqiyiVersion/11.4.5",
        },
        method: 'GET',
    })
    try {
        // console.log(res3.data);

        getTaskRewardsMsg = res3.data.code === 'A00000' && res3.data.dataNew[0] !== undefined ? `任务奖励: ${task.name} => ${res3.data.dataNew[0].name + res3.data.dataNew[0].value} 🎉` : `任务奖励: ${task.name} => ${res3.data.msg !== `成功` && res3.data.msg || `未完成`} ⚠️`

    } catch (e) {
        console.log(e)
    }

    pushMsg.push(getTaskRewardsMsg)
    return getTaskRewardsMsg
}



const iqiyi = async (cookie) => {
    const start = Date.now()
    if (cookie.includes("P00001") && cookie.includes("P00003") && cookie.includes("__dfp")) {
        P00001 = cookie.match(/P00001=(.*?);/)[1];
        P00003 = cookie.match(/P00003=(.*?);/)[1];
        dfp = cookie.match(/__dfp=(.*?)@/)[1];
        console.log("P00001:" + P00001);
        console.log("P00003:" + P00003);
        console.log("dfp:" + dfp);
        console.log("获取Cookie: 成功");

        await get_userinfo()
        await Checkin()

        for (let i = 0; i < 3; i++) {
            const run = await lottery_draw(i);
            // console.log(`${run}\n`);
            if (!run) {
                await delay(10000)
            } else {
                break
            }
        }

        const tasks = await getTaskList();
        for (let i = 0; i < tasks.length; i++) {
            // console.log(tasks[i]);
            if (![1, 4].includes(tasks[i].status)) { //0：待领取 1：已完成 2：未开始 4：进行中
                await joinTask(tasks[i]);
                await delay(10000)
                await notifyTask(tasks[i]);
                await delay(10000)
                await getTaskRewards(tasks[i]);
                console.log(`--------------------`)
            }
        }
        const end = ((Date.now() - start) / 1000).toFixed(2)
        await ddBotNotify(`${pushMsg.join(`\n`)} \n\n签到用时: ${end}秒`).then((res) => {
            console.log(res);
        }).catch((e) => {
            console.log(e);
        })


        console.log('\n签到用时: ' + end + ' 秒')

    } else {
        console.log("请填写cookie")
    }

// })()
}
export default iqiyi