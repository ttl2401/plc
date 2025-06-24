import { Pump } from '@/models/pump.model';
import { TankService } from '@/services/tank.service';
import mongoose from 'mongoose';

const tankService = new TankService();
const arrayTankWithPump = [
  {
    key: "nickel_plating_tank_1",
    pumps : [
      { type : 'electric' },
      { type : 'electric' },
      { type : 'non_electric' }
    ]
  },
  {
    key: "nickel_plating_tank_2",
    pumps : [
      { type : 'electric' },
      { type : 'electric' },
      { type : 'non_electric' }
    ]
  },
  {
    key: "nickel_plating_tank_3",
    pumps : [
      { type : 'electric' },
      { type : 'electric' },
      { type : 'non_electric' }
    ]
  },
  {
    key: "boiling_degreasing_tank_1",
    pumps : [
      { type : 'non_electric' }
    ]
  },
  {
    key: "electro_degreasing_tank_1",
    pumps : [
      { type : 'non_electric' }
    ]
  },
  {
    key: "electro_degreasing_tank_2",
    pumps : [
      { type : 'non_electric' }
    ]
  }
    
]

const migrate = async (): Promise<Boolean> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  for (const tank of arrayTankWithPump){
    const findTank = await tankService.getTankByKey(tank.key);
    
    if(findTank){
      try {
        for (const [index, pump] of tank.pumps.entries()){
          
          const payloadPump = {
            type : pump.type,
            name : (pump.type == 'electric') ? `Bơm điện ${index + 1}` : "Bơm không điện",
            key : `${tank.key}_pump_${pump.type}_${index + 1}`
          }
          try {
            await Pump.create(payloadPump);
          }catch(e){
            console.error(`pump already existed ${payloadPump.key}`)
          }
          
          const upd = await tankService.updateChemistryPumpSetting(findTank._id as string, {
            pumpKey: payloadPump.key,
            pumpType: pump.type,
            pumpName: payloadPump.name,
            time: 0
          })
        }
      }
      catch(e){
        console.error(e);
        await session.abortTransaction();
        session.endSession();
        return false;
      }
    }else {
      console.error('No tank with key ', tank.key);
      await session.abortTransaction();
      session.endSession();
      return false;
    }
  }

  await session.commitTransaction();
  session.endSession();
  return true;
};

export { migrate }; 