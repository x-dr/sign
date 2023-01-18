import iqiyi from './iqiyi.js';
import smzdm from './smzdm.js';
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()

const SMZDM_COOKIE = process.env.SMZDM_COOKIE || '';
const IQIYI_COOKIE = process.env.IQIYI_COOKIE || '';




(async () => {
    console.log(SMZDM_COOKIE ? '开始运行什么值得买签到' : '未填写什么值得买 Cookie ‼️');
    console.log(IQIYI_COOKIE ? '开始运行爱奇艺签到' : '未填写爱奇艺 Cookie ‼️');
    if (SMZDM_COOKIE) {
        await smzdm(SMZDM_COOKIE);
    }

    if (IQIYI_COOKIE) {
        await iqiyi(IQIYI_COOKIE);
    }

})();