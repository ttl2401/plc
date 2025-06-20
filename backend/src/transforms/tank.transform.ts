export function getListSettingTemperature(tanks: any[]): { _id: string, name: string, temp: number | null }[] {
  return tanks.map(tank => ({
    _id: tank._id,
    name: tank.name,
    temp: tank.settings?.temp ?? null
  }));
}
