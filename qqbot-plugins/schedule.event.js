import * as ScheduleService from '../service/scheduleService';

export const name = '定时任务前置插件';
export const weight = 1;
export const info = '定时任务前置插件, 不实际运行, 只加载一次';

ScheduleService.runAllSchedule();

export async function go() { return true; }
