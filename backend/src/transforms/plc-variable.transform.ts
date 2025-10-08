
import { mappingTankNumberInLine } from '@/config/constant';
import { settingTimerControl } from '@/config/plc.variable';

const attachTankIdAndDisable = (data: any[], constantVariableArray: Array<{name: string; tankId: number; disable?: boolean}>) => {
    const nameToTankId = new Map(constantVariableArray.map(x => [x.name, {tankId: x.tankId, disable: x.disable ?? false}]));
    // Nếu muốn GIỮ tất cả phần tử của dataRes, kể cả khi không có tankId:
    return data.map(it => ({ ...it, tankId: nameToTankId.get(it.name)?.tankId ?? null, disable: nameToTankId.get(it.name)?.disable ?? false }));
    
  };


export const mappingTankToVariablesSettingTimer = (data : any) => {
    const dataWithTankId = attachTankIdAndDisable(data, settingTimerControl);
    return dataWithTankId.map(t => {
        return {...t, tank: mappingTankNumberInLine[t.tankId] || {}, disable: t.disable }
    })
  }