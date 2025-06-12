import { TankGroup } from '@/models/tank-group.model';

const arrayTankGroups = [
    {
        name: "Hồ Washing",
        key: "washing",
        settings : {
          timer: 12
        },
        active : true
    },
    {
      name: "Hồ Boiling Degreasing",
      key: "boiling_degreasing",
      settings : {
        timer: 12
      },
      active : true
    },
    {
      name: "Hồ Electro Degreasing",
      key: "electro_degreasing",
      settings : {
        timer: 12
      },
      active : true
    },
    {
      name: "Hồ Activation",
      key: "activation",
      settings : {
        timer: 12
      },
      active : true
    },
    {
      name: "Hồ Pre-nickel Plating",
      key: "pre_nickel_plating",
      settings : {
        timer: 12
      },
      active : true
    },
    {
      name: "Hồ Ultrasonic Hot Rinse",
      key: "ultrasonic_hot_rinse",
      settings : {
        timer: 12
      },
      active : true
    },
    {
      name: "Hồ Hot Rinse",
      key: "hot_rinse",
      settings : {
        timer: 12
      },
      active : true
    },
    {
      name: "Hồ Dryer",
      key: "dryer",
      settings : {
        timer: 12
      },
      active : true
    },
    {
      name: "Hồ Cascade Rinse",
      key: "cascade_rinse",
      active : true
    },
]

const migrate = async (): Promise<void> => {
  for (const tankGroupData of arrayTankGroups){
    try {

    }
    catch(e){

    }
    
    await TankGroup.create(tankGroupData);
  }
};

export { migrate }; 