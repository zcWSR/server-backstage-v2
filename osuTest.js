import { createAllTable } from './qqbot-plugins/db';
import { getRecent, getBP, getPP, sendInfo } from './service/osuService';
import { numberToOsuModes } from './utils/osuUtils';
createAllTable().then(async () => {
  const index = 4
  const info = await getBP({
    osuId: 1434197,
    mode: 0,
    osuName: 'zcWSR'
  }, index);
  await sendInfo(`bp#${index}`, info);
})