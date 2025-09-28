import { PlcVariableConfig } from '@/models/plc-variable-config.model';



const migrate = async (): Promise<Boolean> => {
    /**
     * carrier_index mean the increment index of each carrier for each plating cycle
     */
    const carrierIndex = await PlcVariableConfig.findOne({key: "carrier_index"});
    if(!carrierIndex){
        const newCarrierIndex = new PlcVariableConfig({
            key: "carrier_index",
            value: 0
        });
        await newCarrierIndex.save();
    }

    /**
     * loading_position mean the position of Loading Tank in plating line. Currently only 1 at position 1
     */
    const loading_position = await PlcVariableConfig.findOne({key: "loading_position"});
    if(!loading_position){
        const newLoaddingPosition = new PlcVariableConfig({
            key: "loading_position",
            value: 0
        });
        await newLoaddingPosition.save();
    }
        

    /**
     * current_product_code is the Code that user apply to plating from scanner page
     */
    const current_product_code = await PlcVariableConfig.findOne({key: "current_plating_product_code"});
    if(!current_product_code){
        const newLoaddingPosition = new PlcVariableConfig({
            key: "current_plating_product_code",
            value: null
        });
        await newLoaddingPosition.save();
    }


    return true;
};

export { migrate }; 