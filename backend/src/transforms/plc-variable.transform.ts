
import { mappingTankNumberInLine } from '@/config/constant';
import { settingTimerControl, boSungHoaChatControl } from '@/config/plc.variable';

const attachTankIdAndDisable = (data: any[], constantVariableArray: Array<{name: string; tankId: number; disable?: boolean; note?: string}>) => {
    const nameToTankId = new Map(constantVariableArray.map(x => [x.name, {tankId: x.tankId, disable: x.disable ?? false, note: x.note ?? null}]));
    // Nếu muốn GIỮ tất cả phần tử của dataRes, kể cả khi không có tankId:
    return data.map(it => ({ ...it, tankId: nameToTankId.get(it.name)?.tankId ?? null, disable: nameToTankId.get(it.name)?.disable ?? false , note: nameToTankId.get(it.name)?.note ?? null}));
    
  };


export const mappingTankToVariablesSettingTimer = (data : any) => {
    const dataWithTankId = attachTankIdAndDisable(data, settingTimerControl);
    return dataWithTankId.map(t => {
        return {...t, tank: mappingTankNumberInLine[t.tankId] || {}, disable: t.disable }
    })
  }

export const mappingTankToVariablesSettingChemistry = (data : any) => {
    // Attach tankId and disable status to each variable
    const dataWithTankId = attachTankIdAndDisable(data, boSungHoaChatControl);
    
    // Add tank info to each variable
    const dataWithTank = dataWithTankId.map(t => {
        return {...t, tank: mappingTankNumberInLine[t.tankId] || {} }
    });
    
    // Group by tankId
    const groupedByTankId = dataWithTank.reduce((acc: any, item: any) => {
        const tankId = item.tankId;
        
        // Skip items without tankId
        if (tankId === null || tankId === undefined) {
            return acc;
        }
        
        if (!acc[tankId]) {
            acc[tankId] = {
                tankId: tankId,
                tank: item.tank,
                disable: item.disable,
                chemistryList: []
            };
        }
        
        // Remove tankId and tank from the item before adding to chemistryList
        const { tankId: _, tank: __, ...chemistryItem } = item;
        acc[tankId].chemistryList.push(chemistryItem);
        
        return acc;
    }, {});
    
    // Convert object to array and sort by tankId
    return Object.values(groupedByTankId).sort((a: any, b: any) => a.tankId - b.tankId);
  }