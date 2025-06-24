import { Robot } from '@/models/robot.model';

const arrayRobot = [
    {
        name: "Robot 1",
        key: "robot_1",
        active: true,
        barrelSettings : {
          topDwellTime: 0,
          loweringWaitingTime: 0,
          bottomDwellTime: 0
        },
        rackSettings : {
          topDwellTime: 0,
          loweringWaitingTime: 0,
          bottomDwellTime: 0
        }   
    },
    {
      name: "Robot 2",
      key: "robot_2",
      active: true,
      barrelSettings : {
        topDwellTime: 0,
        loweringWaitingTime: 0,
        bottomDwellTime: 0
      },
      rackSettings : {
        topDwellTime: 0,
        loweringWaitingTime: 0,
        bottomDwellTime: 0
      }   
  },
  {
    name: "Robot 3",
    key: "robot_3",
    active: true,
    barrelSettings : {
      topDwellTime: 0,
      loweringWaitingTime: 0,
      bottomDwellTime: 0
    },
    rackSettings : {
      topDwellTime: 0,
      loweringWaitingTime: 0,
      bottomDwellTime: 0
    }   
}
]

const migrate = async (): Promise<Boolean> => {
  for (const robot of arrayRobot){
    try {
      await Robot.create(robot);  
    }
    catch(e){
      console.error(e);
      return false;
    }
    
  }
  return true;
};

export { migrate }; 