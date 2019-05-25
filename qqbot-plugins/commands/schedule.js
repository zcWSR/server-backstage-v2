import * as BotService from '../../service/botService';
import * as ScheduleService from '../../service/scheduleService';

export const name = 'schedule';
export const shortInfo = '设置定时内容';
export const info = `设置定时显示文字内容, '!schedule 内容' 来调用\n内容不写为查看当前配置\n'!schedule clear' 为清除当前配置\n提供参数 year month date day hour minute second, 用\${xxx}来插入`;

export async function exec(params, body) {
  const { group_id, user_id } = body;
  if (!(await BotService.isSenderOwnerOrAdmin(group_id, user_id))) {
    BotService.sendGroup(group_id, '仅管理员及以上可使用该指令');
    return;
  }
  const currentSchedule = await ScheduleService.getScheduleByGroupId(group_id);
  if (currentSchedule) {
    const { hours, days } = ScheduleService.getRuleFromString(currentSchedule.rule);
    let result = '';
    if (!params) {
      result = '当前设定:\n';
      result += `${ScheduleService.ruleToShownString(hours, days)}`;
      result += `\n执行内容: ${currentSchedule.text}`;
    } else if (params === 'clear') {
      await ScheduleService.removeSchedule(currentSchedule.group_id, currentSchedule.name);
      BotService.sendGroup(group_id, '已清除定时内容');
      return;
    } else {
      const { hours, days } = await ScheduleService.setSchedule(
        group_id,
        currentSchedule.rule,
        params
      );
      result = '设置成功\n';
      result += ScheduleService.ruleToShownString(hours, days);
      result += `\n执行内容: ${params}`;
    }
    BotService.sendGroup(group_id, result);
    return;
  }
  BotService.sendGroup(group_id, `任务不存在, 请先使用指令 '!scheduleTime' 设置任务内容时间`);
}
