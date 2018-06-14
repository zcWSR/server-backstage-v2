import * as BotService from '../../service/botService';
import * as RN from '../read-again-random';

export const name = 'fd';
export const info = `设置复读参数, '!fd rate 0.x'设置随机复读概率, '!fd rate'查看本群当前概率. 其余设置待更新`;

export const paramMap = {
  rate: setRate
};

export function exec(params, body) {
  const [key, value] = params.split(' ');
  const func = paramMap[key];
  if (!func) {
    BotService.sendGroup(body.group_id, `非法参数'${key || 'null'}', 使用'!help fd'查看支持的参数`)
    return;
  }
  func(value, body);
}

async function setRate(value, body) {
  const { group_id, sender_id } = body;
  if (!value) {
    BotService.sendGroup(
      group_id,
      `当前群聊随机复读概率为 ${RN.readAgainRateMap[group_id] * 100}%`
    );
    return;
  }
  const rate = parseFloat(value);
  if (!rate) {
    BotService.sendGroup(group_id, `非法概率值'${value}', 请使用小数设置`);
    return;
  }
  if (rate >= 0.5) {
    if (await BotService.isSenderOwner(group_id, sender_id)) {
      RN.readAgainRateMap[group_id] = rate;
      setRateSuccessMsg(rate, group_id);
    } else {
      BotService.sendGroup(group_id, '由于设置概率为50%及以上极有可能造成性能影响, 仅群主拥有权限');
    }

  } else {
    if (await BotService.isSenderOwnerOrAdmin(group_id, sender_id)) {
      RN.readAgainRateMap[group_id] = rate;
      setRateSuccessMsg(rate, group_id);
    } else {
      BotService.sendGroup(group_id, '设置失败, 仅管理员及以上拥有权限');
    }
  }
}

function setRateSuccessMsg(rate, group_id) {
  BotService.sendGroup(group_id, `设置随机复读概率为 ${rate * 100}%`);
}