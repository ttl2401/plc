export const ProductSettingDefaultTanks = [
    {
        model : "Tanks",
        key : "electro_degreasing_tank_1"
    },
    {
        model : "Tanks",
        key : "electro_degreasing_tank_2"
    },
    {
        model : "TankGroups",
        key : "pre_nickel_plating"
    },
    {
        model : "TankGroups",
        key : "nickel_plating"
    }
]

export const mappingRobotInLine = {
    1 : {
        key : "robot_1"
    },
    2 : {
        key : "robot_2"
    },
    3 : {
        key : "robot_3"
    }
}

export const mappingTankNumberInLine : Record<number, any> = {
    1 : {
        key : "loading_station_1",
        groupKey : "loading_station",
        name : "Loading Station",
    },
    2: {
        key : "cross_transporter_1",
        groupKey : "cross_transporter",
        name: "Cross Transporter"
    },
    3: {
        key : "storage_1",
        groupKey : "storage",
        name : "Storage"
    },
    4 : {
        key : "storage_2",
        groupKey : "storage",
        name : "Storage"
    },
    5 : {
        key : "washing_tank_1",
        groupKey : "washing",
        name : "Washing"
    },
    6 : {
        key: "cascade_rinse_tank_1",
        groupKey : "cascade_rinse",
        name: "Cascade Rinse 1"
    },
    7 : {
        key : "cascade_rinse_tank_2",
        groupKey : "cascade_rinse",
        name: "Cascade Rinse 2"
    },
    8 : {
        key : "cascade_rinse_tank_3",
        groupKey : "cascade_rinse",
        name: "Cascade Rinse 3"
    },
    9 : {
        key : "boiling_degreasing_tank_1",
        groupKey : "boiling_degreasing",
        name: "Boiling Degreasing"
    },
    10 : {
        key : "cascade_rinse_tank_4",
        groupKey : "cascade_rinse",
        name: "Cascade Rinse 4"
    },
    11 : {
        key : "cascade_rinse_tank_5",
        groupKey : "cascade_rinse",
        name: "Cascade Rinse 5"
    },
    12 : {
        key : "cascade_rinse_tank_6",
        groupKey : "cascade_rinse",
        name: "Cascade Rinse 6"
    },
    13 : {
        key : "electro_degreasing_tank_1",
        groupKey : "electro_degreasing",
        name: "Electro Degreasing 1"
    },
    14 : {
        key : "electro_degreasing_tank_2",
        groupKey : "electro_degreasing",
        name: "Electro Degreasing 2"
    },
    15 : {
        key : "cascade_rinse_tank_7",
        groupKey : "cascade_rinse",
        name : "Cascade Rinse 7"
    },
    16 : {
        key : "cascade_rinse_tank_8",
        groupKey : "cascade_rinse",
        name : "Cascade Rinse 8"
    },
    17 : {
        key : "cascade_rinse_tank_9",
        groupKey : "cascade_rinse",
        name : "Cascade Rinse 9"
    },
    18 : {
        key : "cross_transporter_rinse_1",
        groupKey : "cross_transporter_rinse",
        name : "Cross Transporter Rinse 1"
    },
    19 : {
        key : "cross_transporter_rinse_2",
        groupKey : "cross_transporter_rinse",
        name : "Cross Transporter Rinse 2"
    },
    20: {
        key: "activation_tank_1",
        groupKey : "activation",
        name : "Activation"
    },
    21: {
        key: "pre_nickel_plating_tank_1",
        groupKey : "pre_nickel_plating",
        name : "Pre-nickel Plating"
    },
    22: {
        key: "cascade_rinse_tank_10",
        groupKey : "cascade_rinse",
        name : "Cascade Rinse 10"
    },
    23: {
        key: "nickel_plating_tank_1",
        groupKey : "nickel_plating",
        slot : 1,
        name : "Nickel Plating 1"
    },
    24: {
        key: "nickel_plating_tank_2",
        groupKey : "nickel_plating",
        slot: 2,
        name : "Nickel Plating 2"
    },
    25: {
        key: "nickel_plating_tank_3",
        groupKey : "nickel_plating",
        slot: 3,
        name : "Nickel Plating 3"
    },
    26: {
        key: "cascade_rinse_tank_11",
        groupKey : "cascade_rinse",
        name : "Cascade Rinse 11"
    },
    27: {
        key: "cascade_rinse_tank_12",
        groupKey : "cascade_rinse",
        name : "Cascade Rinse 12"
    },
    28: {
        key: "cascade_rinse_tank_13",
        groupKey : "cascade_rinse",
        name : "Cascade Rinse 13"
    },
    29: {
        key: "ultrasonic_hot_rinse_tank_1",
        groupKey : "ultrasonic_hot_rinse",
        name : "Ultrasonic Hot Rinse"
    },
    30: {
        key: "hot_rinse_tank_1",
        groupKey : "hot_rinse",
        name : "Hot Rinse"
    },
    31: {
        key: "dryer_tank_1",
        groupKey : "dryer",
        name : "Dryer",
        slot: 1
    },
    32: {
        key: "dryer_tank_2",
        groupKey : "dryer",
        name : "Dryer",
        slot: 2
    },
    33: {
        key: null
    },
    34: {
        key: 'cross_transporter_2',
        groupKey : "cross_transporter",
        name : "Cross Transporter",
    },
    35: {
        key: 'unloading_station_1',
        groupKey : "unloading_station",
        name : "Unloading Stations",
    }

}


/**
 * Monitor Temperature at extend/electric-current
 */

function pickTanks(ids: number[], mapping: any): Record<number, any> {
    const out: Record<number, any> = Object.create(null); // tránh prototype
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i]!;
      const v = mapping[id as number];
      if (v !== undefined) out[id] = v; 
    }
    return out;
}

function mergeSortedUnique(a: number[], b: number[]): number[] {
    const c: number[] = [];
    let i = 0, j = 0;
    let last: number | undefined;
  
    while (i < a.length && j < b.length) {
      let v: number;
      if (a[i] < b[j]) v = a[i++];
      else if (a[i] > b[j]) v = b[j++];
      else { v = a[i]; i++; j++; } // bằng nhau -> lấy 1 lần
  
      if (v !== last) { c.push(v); last = v; }
    }
    while (i < a.length) {
      const v = a[i++];
      if (v !== last) { c.push(v); last = v; }
    }
    while (j < b.length) {
      const v = b[j++];
      if (v !== last) { c.push(v); last = v; }
    }
    return c;
  }

  
// Temperature
export const listTankMonitorWithTemperature = [ 5, 9, 13, 14, 23, 24, 29, 30, 31 ]
export const elementTankMonitorWithTemperature = pickTanks(listTankMonitorWithTemperature, mappingTankNumberInLine)

// Electric
export const listTankMonitorWithElectric = [ 13, 14, 21, 23, 24 ]
export const elementTankMonitorWithElectric = pickTanks(listTankMonitorWithElectric, mappingTankNumberInLine)

// Both
export const listTankMonitorWithTemperatureAndElectric = mergeSortedUnique(listTankMonitorWithTemperature, listTankMonitorWithElectric);
export const elementTankMonitorWithTemperatureAndElectric = pickTanks(listTankMonitorWithTemperatureAndElectric, mappingTankNumberInLine)
/**
 * End
 */
