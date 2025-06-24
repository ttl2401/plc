export function getListSettingTemperature(tanks: any[]): { _id: string, name: string, temp: number | null }[] {
  return tanks.map(tank => ({
    _id: tank._id,
    name: tank.name,
    temp: tank.settings?.temp ?? null
  }));
}

export function getListSettingChemistry(tanks: any[]): { _id: string, name: string, chemistry: any }[] {
  return tanks.map(tank  => {
    const chemistry = tank.settings?.chemistry ?? {AHToAdded : 0, pumps : []}  
    return {
      _id: tank._id,
      name: tank.name,
      chemistry : chemistry
    };
  });
  
}
