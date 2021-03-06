import moment from 'moment-timezone';
import logger from '../utils/logger';
import { db } from '../qqbot-plugins/db';
import schedule, { scheduleJob } from 'node-schedule-tz';
import * as BotService from '../service/botService';

const DAY_MAP = {
  0: '星期天',
  1: '星期一',
  2: '星期二',
  3: '星期三',
  4: '星期四',
  5: '星期五',
  6: '星期六',
  7: '星期天',
};

export function getAllSchedule() {
  return db('schedule').select('*');
}

export async function getScheduleNameByGroupId(groupId) {
  const meta = await db('schedule')
    .first('name')
    .where('group_id', groupId);
  if (!meta) return null;
  return meta.name;
}

export function getScheduleByGroupId(groupId) {
  return db('schedule')
    .first()
    .where('group_id', groupId);
}

export function getRuleFromString(ruleString) {
  let [hourString, dayString = 'everyday'] = ruleString.split(' ');
  let hours = hourString.split(',').reduce((result, hour) => {
    hour = parseInt(+hour);
    if (hour >= 0 && hour <= 23 && result.indexOf(hour) == -1) {
      result.push(hour);
    }
    return result;
  }, []);
  if (!hours.length) {
    hours = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  }
  hours = hours.sort();
  if (dayString === 'weekend' || dayString === '周末') {
    dayString = '6,7';
  }
  if (dayString === 'weekday' || dayString === '工作日') {
    dayString = '1,2,3,4,5';
  }
  if (dayString === 'everyday' || dayString === '每天') {
    dayString = '1,2,3,4,5,6,7';
  }
  let days = dayString.split(',').reduce((result, day) => {
    day = parseInt(+day);
    if (day >= 0 && day <= 7 && result.indexOf(day) == -1) {
      result.push(day);
    }
    return result;
  }, []);
  if (!days.length) {
    days = [1, 2, 3, 4, 5];
  }
  days = days.sort();
  return {
    rule: `0 0 ${hours.join(',')} ? * ${days.join(',')}`,
    hours,
    days
  };
}

function addZero(number, wantLength) {
  return `0000000000${number}`.slice(-wantLength);
}

function formatText(text) {
  const now = moment(new Date).tz('Asia/Shanghai');
  return text
    .replace(/\\n/g, '\n')
    .replace(/\$\{hour\}/g, now.hours())
    .replace(/\$\{minute\}/g, now.minutes())
    .replace(/\$\{second\}/g, now.seconds())
    .replace(/\$\{year\}/g, now.year())
    .replace(/\$\{month\}/g, now.month() + 1)
    .replace(/\$\{date\}/g, now.date())
    .replace(/\$\{day\}/g, DAY_MAP[now.day()]);
}

export function sendText(groupId, text) {
  const formatedText = formatText(text);
  logger.info('auto sendText to', groupId, formatedText);
  BotService.sendGroup(groupId, formatedText);
}

export function runSchedule(groupId, name, ruleString, text) {
  const { hours, days, rule } = getRuleFromString(ruleString);
  logger.info(`rule '${rule}'`);
  scheduleJob(name, rule, 'Asia/Shanghai', sendText.bind(null, groupId, text));
  return { hours, days };
}

export async function runAllSchedule() {
  try {
    const all = await getAllSchedule();
    all.forEach(schedule => {
      const { group_id, name, rule: ruleString, text } = schedule;
      runSchedule(group_id, name, ruleString, text);
      logger.info(`run schedule '${name}'`);
    });
  } catch(e) {
    logger.error(e);
  } finally {
    logger.info('start all schedule');
  }
}

export function cancelSchedule(name) {
  const job = schedule.scheduledJobs[name];
  if (job) {
    job.cancel();
  }
}

export async function setSchedule(groupId, rule, text) {
  const name = await getScheduleNameByGroupId(groupId);
  if (name) {
    cancelSchedule(name);
  }
  const newName = `s-${groupId}`;
  const { hours, days } = runSchedule(groupId, newName, rule, text);
  if (name) {
    await db('schedule')
      .update({
        name: newName,
        rule: `${hours.join(',')} ${days.join(',')}`,
        text
      })
      .where('group_id', groupId);
  } else {
    await db('schedule').insert({
      group_id: groupId,
      name: newName,
      rule: `${hours.join(',')} ${days.join(',')}`,
      text
    });
  }
  return { hours, days };
}

export async function removeSchedule(groupId, name) {
  // const schedule = await getScheduleByGroupId(groupId);
  // if (!schedule) {
  //   return -1;
  // }
  cancelSchedule(name);
  await db('schedule')
    .where('group_id', groupId)
    .del();
  return 0;
}

export function ruleToShownString(hours, days) {
  let result = '';

  if (days[0] === 6 && days.length === 2) {
    result = '每周末的';
  } else if (days[0] === 1 && days.indexOf(6) === -1 && days.indexOf(7) === -1 && days.length === 5) {
    result = '每周工作日的';
  } else if (days[0] == 1 && days.length === 7) {
    result = '每天的'
  } else {
    result =
      days.reduce((prev, current) => {
        return `${prev}${DAY_MAP[current]}、`;
      }, '每周').slice(0, - 1) + '的';
  }

  return hours.reduce((prev, current) => {
    return `${prev}${current}点`;
  }, result);
}
