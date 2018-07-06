import * as BotService from '../../service/botService';
import * as OSUService from '../../service/osuService';

export const name = 'bp';
export const info = `查询某特定账号的bp数据, '!bp 玩家名,第几bp,mode'来调用
第几bp不传默认为第一bp, mode不写默认为osu!模式
模式代码: (0 = osu!, 1 = Taiko, 2 = CtB, 3 = osu!mania)`;
// export const hide = true;

export async function exec(params, body) {
  const { group_id, user_id } = body;
  params = params.trim();
  if (!params) {
    BotService.sendGroup(group_id, `缺少查询参数, 使用'!help bp'查看调用方式`);
    return;
  }
  params = params.replace('，', ','); // 处理全角逗号
  params = params.split(',');
  const osuName = params[0];
  if (!osuName) {
    BotService.sendGroup(group_id, `非法参数, 请输入玩家昵称`);
    return;
  }
  const bpIndex = parseInt(params[1] || 1) || -1;
  if (bpIndex > 20 || bpIndex < 0) {
    BotService.sendGroup(group_id, `非法参数, 仅支持bp查询范围#1-#20, 请重试`);
    return;
  }
  const mode = parseInt(params[2] || 0) || -1;
  if (mode !== 0 || mode !== 1 || mode !== 2 || mode !== 3) {
    BotService.sendGroup(group_id, `非法参数, 请不要写不存在的模式谢谢`);
    return;
  }
  const userInfo = await OSUService.getUserByName(osuName, mode);
  if (typeof user === 'string') {
    BotService.sendGroup(group_id, user);
    return;
  }
  const bpInfo = await OSUService.getBP(userInfo, bpIndex);
  if (typeof bpInfo === 'string') {
    BotService.sendGroup(group_id, bpInfo);
    return;
  }
  await OSUService.sendInfo(`bp#${bpIndex}`, bpIndex, group_id);
}
