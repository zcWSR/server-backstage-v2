import { createAllTable } from './qqbot-plugins/db';
import { getRecent, getBP, getPP, sendInfo } from './service/osuService';
import { numberToOsuModes } from './utils/osuUtils';
import { getHso } from './qqbot-plugins/commands/get-konachan-random';
import schedule from 'node-schedule';
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
schedule.scheduleJob('* * 4,5,6 ? * 6,7', () => {
  console.log('aaaa');
});
