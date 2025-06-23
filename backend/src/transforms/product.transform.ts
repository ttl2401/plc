import { IProduct } from '@/models/product.model';
import { API_URL } from '@/config';
import { PaginateResult } from '@/controllers/base.controller';
import { ProductSettingDefaultTanks } from '@/config/constant';
import { Tank } from '@/models/tank.model';
import { TankGroup } from '@/models/tank-group.model';

export const getList = (data: PaginateResult<IProduct>) => {
  const products = data.docs.map(product => ({
    ...product.toObject(),
    imageUrl: product.image ? `${API_URL}/${product.image}` : '',
  }));
  return { ...data, docs: products };
};

export const getDetail = (data: IProduct) => {
  const product = data.toObject();
  const image =product.image || '';
  const imageUrl = image  ? `${API_URL}/${image}` : ''
  return { ...product, ...{image, imageUrl} };
};
  

export const getSettingDetail = async (data: IProduct, line: number) => {
  const product = data.toObject();
  const settings =  product.settings || [];
  // Find the setting for the specific line
  let settingForLine = settings.find((s: any) => s.line == line);

  // If settings for the line does not exist, build it
  if (!settingForLine) {
    // Helper to resolve model info by key
    const resolveModel = async (model: string, key: string, mode: string) => {
      if (model === 'Tanks') {
        const tank = await Tank.findOne({ key });
        if (!tank) return null;
        if (mode === 'rack') {
          return {
            model: 'Tanks',
            modelId: tank._id,
            modelKey: tank.key,
            modelName: tank.name,
            currentJig: 0,
            currentTotal: 0,
            T1: 0,
            T2: 0
          };
        } else if (mode === 'barrel') {
          return {
            model: 'Tanks',
            modelId: tank._id,
            modelKey: tank.key,
            modelName: tank.name,
            currentTotal: 0,
            T1: 0,
            T2: 0
          };
        }
      } else if (model === 'TankGroups') {
        const group = await TankGroup.findOne({ key });
        if (!group) return null;
        if (mode === 'rack') {
          return {
            model: 'TankGroups',
            modelId: group._id,
            modelKey: group.key,
            modelName: group.name,
            currentJig: 0,
            currentTotal: 0,
            T1: 0,
            T2: 0
          };
        } else if (mode === 'barrel') {
          return {
            model: 'TankGroups',
            modelId: group._id,
            modelKey: group.key,
            modelName: group.name,
            currentTotal: 0,
            T1: 0,
            T2: 0
          };
        }
      }
      return null;
    };
    
    const rackTankAndGroups = (await Promise.all(
      ProductSettingDefaultTanks.map(item => resolveModel(item.model, item.key, 'rack'))
    )).filter(Boolean) as any[];
    
    const barrelTankAndGroups = (await Promise.all(
      ProductSettingDefaultTanks.map(item => resolveModel(item.model, item.key, 'barrel'))
    )).filter(Boolean) as any[];

    settingForLine = {
      line: line,
      rackPlating: {
        jigCarrier: 0,
        pcsJig: 0,
        timer: 0,
        tankAndGroups: rackTankAndGroups
      },
      barrelPlating: {
        kgBarrel: 0,
        timer: 0,
        tankAndGroups: barrelTankAndGroups
      }
    };
  }
  
  // Return the base product details along with the specific setting for the line
  return settingForLine;
};