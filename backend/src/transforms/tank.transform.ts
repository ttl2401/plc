
const mappedPLCVariableName : Record<string, string> = {
  "washing_tank_1" : "Cai_nhiet_do_Washing",
  "boiling_degreasing_tank_1" : "Cai_nhiet_do_Boiling_Degreasing",
  "electro_degreasing_tank_1" : "Cai_nhiet_do_Electro_Degreasing_1",
  "electro_degreasing_tank_2" : "Cai_nhiet_do_Electro_Degreasing_2",
  "nickel_plating_tank_1" : "Cai_nhiet_do_Nickel_Plating_1",
  "nickel_plating_tank_2" : "Cai_nhiet_do_Nickel_Plating_2",
  "nickel_plating_tank_3" : "Cai_nhiet_do_Nickel_Plating_3",
  "ultrasonic_hot_rinse_tank_1" : "Cai_nhiet_do_Ultrasonic_Hot_Rinse",
  "hot_rinse_tank_1" : "Cai_nhiet_do_Hot_Rinse",
  "dryer_tank_1" : "Cai_nhiet_do_Dryer_1"
}


export function getListSettingTemperature(tanks: any[]): { _id: string, name: string, temp: number | null }[] {
  return tanks.map(tank => ({
    _id: tank._id,
    name: tank.name,
    temp: tank.settings?.temp ?? null,
    plcVariableName: mappedPLCVariableName[tank.key ?? ""] ?? null
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
