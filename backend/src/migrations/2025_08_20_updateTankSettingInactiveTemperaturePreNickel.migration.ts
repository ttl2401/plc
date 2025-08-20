import { Tank } from '@/models/tank.model';



const migrate = async (): Promise<Boolean> => {
    const tank = await Tank.findOne({key: "pre_nickel_plating_tank_1"});

    if(tank){
        tank.settings = null;
        tank.save();
    }
        

    return true;
};

export { migrate }; 