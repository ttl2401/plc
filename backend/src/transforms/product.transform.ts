import { IProduct } from '@/models/product.model';
import { API_URL } from '@/config';
import { PaginateResult } from '@/controllers/base.controller';
import { ProductSettingDefaultTanks, productPlatingModes } from '@/config/constant';
import { Tank } from '@/models/tank.model';
import { TankGroup } from '@/models/tank-group.model';
import { mappingTankNumberInLine } from '@/config/constant';

const mappedPLCVariableName : Record<string, string> = {
  "timer" : "May_tinh_Ghi_CPU_Thoi_gian_Ma",
 
}


export const getList = (data: PaginateResult<IProduct>) => {
  const products = data.docs.map(product => ({
    ...product.toObject(),
    imageUrl: product.image ? `${API_URL}/${product.image}` : `${API_URL}/assets/product_default.png`,
  }));
  return { ...data, docs: products };
};

export const getDetail = (data: IProduct) => {
  const product = data.toObject();
  const image =product.image || '';
  const imageUrl = image  ? `${API_URL}/${image}` : `${API_URL}/assets/product_default.png`
  return { ...product, ...{image, imageUrl} };
};
  

export const getSettingDetail = async (data: IProduct, line: number) => {
  const product = data.toObject();
  const settings =  product.settings || [];
  // Find the setting for the specific line
  let settingForLine = settings.find((s: any) => s.line == line);

  // Helper to resolve model info by key
  const resolveModel = async (model: string, key: string, mode: string) => {
    if (model === 'Tanks') {
      const tank = await Tank.findOne({ key });
      if (!tank) return null;
      
      if (mode === 'default') {
        return {
          model: 'Tanks',
          modelId: tank._id,
          modelKey: tank.key,
          modelName: tank.name,
          currentTotal: 0,
          T1: 0
        };
      } else {
        // For rack, barrel, and other modes
        return {
          model: 'Tanks',
          modelId: tank._id,
          modelKey: tank.key,
          modelName: tank.name,
          currentJig: mode === 'rack' ? 0 : undefined,
          currentTotal: 0,
          T1: 0,
          T2: 0
        };
      }
    } else if (model === 'TankGroups') {
      const group = await TankGroup.findOne({ key });
      if (!group) return null;
      
      if (mode === 'default') {
        return {
          model: 'TankGroups',
          modelId: group._id,
          modelKey: group.key,
          modelName: group.name,
          currentTotal: 0,
          T1: 0
        };
      } else {
        // For rack, barrel, and other modes
        return {
          model: 'TankGroups',
          modelId: group._id,
          modelKey: group.key,
          modelName: group.name,
          currentJig: mode === 'rack' ? 0 : undefined,
          currentTotal: 0,
          T1: 0,
          T2: 0
        };
      }
    }
    return null;
  };

  // Helper to generate plating mode properties dynamically
  const generatePlatingMode = async (modeKey: string) => {
    const tankAndGroups = (await Promise.all(
      ProductSettingDefaultTanks.map(item => resolveModel(item.model, item.key, modeKey))
    )).filter(Boolean) as any[];

    if (modeKey === 'default') {
      return {
        tankAndGroups: tankAndGroups
      };
    } else {
      // For rack, barrel, and other modes
      const baseConfig = {
        timer: 0,
        tankAndGroups: tankAndGroups,
        plcVariableTimer: mappedPLCVariableName['timer']
      };

      // Add mode-specific properties
      if (modeKey === 'rack') {
        return {
          ...baseConfig,
          jigCarrier: 0,
          pcsJig: 0
        };
      } else if (modeKey === 'barrel') {
        return {
          ...baseConfig,
          kgBarrel: 0
        };
      } else {
        // For any other modes, add generic properties
        return {
          ...baseConfig,
          // Add mode-specific properties here if needed
        };
      }
    }
  };

  // If settings for the line does not exist, build it completely
  if (!settingForLine) {
    settingForLine = {
      line: line,
      mode: productPlatingModes[0]?.key || 'default'
    };

    // Generate only plating modes that exist in productPlatingModes
    for (const mode of productPlatingModes) {
      const modeKey = mode.key;
      const platingPropertyName = `${modeKey}Plating`;
      settingForLine[platingPropertyName] = await generatePlatingMode(modeKey);
    }
  } else {
    // Check if current mode exists in productPlatingModes, if not change to first available mode
    const currentModeExists = productPlatingModes.some(mode => mode.key === settingForLine.mode);
    if (!currentModeExists && productPlatingModes.length > 0) {
      settingForLine.mode = productPlatingModes[0].key;
    }

    // Remove any plating modes that are not in productPlatingModes
    const existingPlatingModes = Object.keys(settingForLine).filter(key => key.endsWith('Plating'));
    for (const existingMode of existingPlatingModes) {
      const modeKey = existingMode.replace('Plating', '');
      const modeExists = productPlatingModes.some(mode => mode.key === modeKey);
      if (!modeExists) {
        delete settingForLine[existingMode];
      }
    }

    // Check and generate missing plating modes that are in productPlatingModes
    for (const mode of productPlatingModes) {
      const modeKey = mode.key;
      const platingPropertyName = `${modeKey}Plating`;
      
      if (!settingForLine[platingPropertyName]) {
        settingForLine[platingPropertyName] = await generatePlatingMode(modeKey);
      }
    }
  }
  
  // Return the base product details along with the specific setting for the line
  return settingForLine;
};


export const getSettingList = (data: PaginateResult<IProduct>) => {
  const products = data.docs.map(product => ({
    ...product.toObject(),
    imageUrl: product.image ? `${API_URL}/${product.image}` : `${API_URL}/assets/product_default.png`,
  }));
  return { ...data, docs: products };
};

export const mappingTankToList = (data : any) => {
  return data.map((record : any )=> {
    const tanks = record.tanks || [];
    const mappingTanks = tanks.map((tank: any) => {
      tank.tank = mappingTankNumberInLine[tank.tankId] || {}
      return tank;
    })
    return {...record, tanks : mappingTanks}
  })
}