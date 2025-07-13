import { Product } from '@/models/product.model';
import { Point } from '@influxdata/influxdb-client'
import { writeApi, queryApi } from '@/config/influxdb'
import { TemperatureService } from '@/services/temperature.service'
const temperatureService = new TemperatureService();

import moment from 'moment';

const processTanks = [
    {
        name : "washing",
        value : [
            {
                type: "temperature",
                range : [400, 800]
            }
        ]
    },
    {
        name : "boiling_degreasing",
        value : [
            {
                type: "temperature",
                range : [400, 800]
            }
        ]
    },
    {
        name : "electro_degreasing",
        value : [
            {
                type: "temperature",
                range : [400, 800]
            },
            {
                type: "ampere",
                range : [900, 1100]
            },
            {
                type: "slot",
                range : [1,2]
            }
        ]
    },
    {
        name : "pre_nickel_plating",
        value : [
            {
                type: "temperature",
                range : [400, 800]
            },
            {
                type: "ampere",
                range : [900, 1100]
            }
        ]
    },
    {
        name : "nickel_plating",
        value : [
            {
                type: "temperature",
                range : [400, 800]
            },
            {
                type: "ampere",
                range : [900, 1100]
            },
            {
                type: "slot",
                range : [1,2]
            }
        ]
    },
    {
        name : "ultrasonic_hot_rinse",
        value : [
            {
                type: "temperature",
                range : [400, 800]
            }
        ]
    },
    {
        name : "cascade_rinse",
        value : [
            {
                type: "slot",
                range : [1,3]
            }
        ]
    },
    {
        name : "hot_rinse",
        value : [
            {
                type: "temperature",
                range : [400, 800]
            }
        ]
    },
    {
        name : "dryer",
        value : [
            {
                type: "temperature",
                range : [400, 800]
            },
            {
                type: "slot",
                range : [1, 2]
            }
        ]
    },
    {
        name : "cascade_rinse",
        value : [
            {
                type: "slot",
                range : [4,8]
            }
        ]
    },
    {
        name : "cascade_rinse",
        value : [
            {
                type: "slot",
                range : [9,10]
            }
        ]
    },
];
const sleep = async (s: number) => {
    return new Promise(resolve => setTimeout(resolve, s * 1000));
}

const faker = async (): Promise<Boolean> => {
  const products = await Product.find({});
  try {
    for (const product of products){
        const code = product.code;
        const exists = await temperatureService.isProductExistInInflux(code);
        if (exists) {
            console.log(`⏭️ Product ${code} already exists in InfluxDB. Skipping.`);
            continue;
        }

        for (const tank of processTanks) {
            const point = new Point("information_process")
              .tag('code', code)
              .tag('tank', tank.name);
        
            const timeIn = Number(moment().unix());
            point.intField('timeIn', timeIn);
        
            // ➕ Sinh giá trị random theo range
            for (const param of tank.value) {
              const [min, max] = param.range;
              const value = Math.floor(Math.random() * (max - min + 1)) + min;
        
              if (param.type === 'temperature') {
                point.intField('temperature', value);
              } else if (param.type === 'ampere') {
                point.intField('ampere', value);
              } else if (param.type === 'slot') {
                point.intField('slot', value);
              }
            }
        
            await sleep(5); // Giả lập thời gian thực
        
            const timeOut = Number(moment().unix());
            point.intField('timeOut', timeOut);
        
            writeApi.writePoint(point);
          }

    }
    await writeApi.flush();
  }
  catch (e){
    console.error(e);
    return false;
  }
  return true;
};

export { faker }; 