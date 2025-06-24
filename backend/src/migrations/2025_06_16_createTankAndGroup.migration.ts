import { Tank } from '@/models/tank.model';
import { TankGroup } from '@/models/tank-group.model';

const arrayTankGroups = [
    {
        name: "Hồ Washing",
        key: "washing",
        settings : {
          timer: 12
        },
        active : true,
        tanks : [
          {
            name: "Hồ Washing",
            key: "washing_tank_1",
            settings : {
              temp: 20
            },
            active : true
          }
        ]
    },
    {
      name: "Hồ Boiling Degreasing",
      key: "boiling_degreasing",
      settings : {
        timer: 12
      },
      active : true,
      tanks : [
        {
          name: "Hồ Boiling Degreasing",
          key: "boiling_degreasing_tank_1",
          settings : {
            temp: 20
          },
          active : true
        }
      ]
    },
    {
      name: "Hồ Electro Degreasing",
      key: "electro_degreasing",
      settings : {
        timer: 12
      },
      active : true,
      tanks : [
        {
          name: "Hồ Electro Degreasing 1",
          key: "electro_degreasing_tank_1",
          settings : {
            temp: 20
          },
          active : true
        },
        {
          name: "Hồ Electro Degreasing 2",
          key: "electro_degreasing_tank_2",
          settings : {
            temp: 20
          },
          active : true
        }
      ]
    },
    {
      name: "Hồ Activation",
      key: "activation",
      settings : {
        timer: 12
      },
      active : true,
      tanks : [
        {
          name: "Hồ Activation",
          key: "activation_tank_1",
          settings : null,
          active : true
        }
      ]
    },
    {
      name: "Hồ Pre-nickel Plating",
      key: "pre_nickel_plating",
      settings : {
        timer: 12
      },
      active : true,
      tanks : [
        {
          name: "Hồ Pre-nickel Plating",
          key: "pre_nickel_plating_tank_1",
          settings : {
            temp: 20
          },
          active : true
        }
      ]
    },
    {
      name: "Hồ Nickel Plating",
      key: "nickel_plating",
      settings : null,
      active : true,
      tanks : [
        {
          name: "Hồ Nickel Plating 1",
          key: "nickel_plating_tank_1",
          settings : {
            temp: 20
          },
          active : true
        },
        {
          name: "Hồ Nickel Plating 2",
          key: "nickel_plating_tank_2",
          settings : {
            temp: 20
          },
          active : true
        },
        {
          name: "Hồ Nickel Plating 3",
          key: "nickel_plating_tank_3",
          settings : {
            temp: 20
          },
          active : false
        }
      ]
    },
    {
      name: "Hồ Ultrasonic Hot Rinse",
      key: "ultrasonic_hot_rinse",
      settings : {
        timer: 12
      },
      active : true,
      tanks : [
        {
          name: "Hồ Ultrasonic Hot Rinse",
          key: "ultrasonic_hot_rinse_tank_1",
          settings : {
            temp: 20
          },
          active : true
        }
      ]
    },
    {
      name: "Hồ Hot Rinse",
      key: "hot_rinse",
      settings : {
        timer: 12
      },
      active : true,
      tanks : [
        {
          name: "Hồ Hot Rinse",
          key: "hot_rinse_tank_1",
          settings : {
            temp: 20
          },
          active : true
        }
      ]
    },
    {
      name: "Hồ Dryer",
      key: "dryer",
      settings : {
        timer: 12
      },
      active : true,
      tanks : [
        {
          name: "Hồ Dryer 1",
          key: "dryer_tank_1",
          settings : {
            temp: 20
          },
          active : true
        }
      ]
    },
    {
      name: "Hồ Cascade Rinse",
      key: "cascade_rinse",
      active : true,
      tanks : [
        {
          name: "Hồ Cascade Rinse 1-6",
          key: "cascade_rinse_tank_1",
          settings : null,
          active : true
        },
        {
          name: "Hồ Cascade Rinse 2-7",
          key: "cascade_rinse_tank_2",
          settings : null,
          active : true
        },
        {
          name: "Hồ Cascade Rinse 3-8",
          key: "cascade_rinse_tank_3",
          settings : null,
          active : true
        },
        {
          name: "Hồ Cascade Rinse 1-10",
          key: "cascade_rinse_tank_4",
          settings : null,
          active : true
        },
        {
          name: "Hồ Cascade Rinse 2-11",
          key: "cascade_rinse_tank_5",
          settings : null,
          active : true
        },
        {
          name: "Hồ Cascade Rinse 3-12",
          key: "cascade_rinse_tank_6",
          settings : null,
          active : true
        },
        {
          name: "Hồ Cascade Rinse 1-15",
          key: "cascade_rinse_tank_7",
          settings : null,
          active : true
        },
        {
          name: "Hồ Cascade Rinse 2-16",
          key: "cascade_rinse_tank_8",
          settings : null,
          active : true
        },
        {
          name: "Hồ Cascade Rinse 3-17",
          key: "cascade_rinse_tank_9",
          settings : null,
          active : true
        },
        {
          name: "Hồ Cascade Rinse 1-22",
          key: "cascade_rinse_tank_10",
          settings : null,
          active : true
        },
        {
          name: "Hồ Cascade Rinse 2-26",
          key: "cascade_rinse_tank_11",
          settings : null,
          active : true
        },
        {
          name: "Hồ Cascade Rinse 3-27",
          key: "cascade_rinse_tank_12",
          settings : null,
          active : true
        },
        {
          name: "Hồ Cascade Rinse 4-28",
          key: "cascade_rinse_tank_13",
          settings : null,
          active : true
        }
      ]
    },
]

const migrate = async (): Promise<Boolean> => {
  for (const tankGroupData of arrayTankGroups){
    try {
      await TankGroup.create(tankGroupData);
      const tanks = tankGroupData.tanks || [];
      for (const tank of tanks){
        const payload = {
          name: tank.name,
          key: tank.key,
          settings : tank.settings,
          active : tank.active,
          groupKey : tankGroupData.key
        }
        try {
          await Tank.create(payload)
        }
        catch(e){     
          console.error(e);
          return false;
        }
        
      }
    }
    catch(e){
      console.error(e);
      return false;
    }
    
  }

  return true;
};

export { migrate }; 