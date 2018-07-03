import { createAllTable } from './qqbot-plugins/db';
import { getRecent, getBP, getPP } from './service/osuService';
import { toBin } from './utils/osuUtils';
createAllTable().then(async () => {
  let info = await getRecent(1434197, 0);
  console.log(info.mapInfo.title);
  console.log(info.mapInfo.version);
  await getPP(info);
  // const info = await getBP(1434197, 0, 3);
  // await getPP(info);
})