import { createAllTable } from './qqbot-plugins/db';
import { getRecent, getBP, getPP, sendInfo } from './service/osuService';
import { numberToOsuModes } from './utils/osuUtils';
import { getHso } from './qqbot-plugins/commands/get-konachan-random';
import schedule from 'node-schedule-tz';
// createAllTable().then(async () => {
//   const index = 4
//   const info = await getBP({
//     osuId: 1434197,
//     mode: 0,
//     osuName: 'zcWSR'
//   }, index);
//   await sendInfo(`bp#${index}`, info);
// })

// getHso().then((url) => {
//   console.log(url);
//   return getHso()
// }).then((url) => {
//   console.log(url);
// })
schedule.scheduleJob('job a','* * 17 ? * 6,7', 'Asia/Shanghai', () => {
  console.log('aaaa');
});
schedule.scheduleJob('job b', '* * 17,18 ? * 6,7', 'Asia/Shanghai', () => {
  console.log('bbb');
});
