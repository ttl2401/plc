export const plcControlButtonConfig = [
    {
      "name": "Start_Nhanh_1",
      "dbNumber": 65,
      "dataType": "Bool",
      "offset": 0.0,
      "type": "plc_control",
      "startValue": false,
      "value": false
    },
    {
      "name": "Start_Nhanh_2",
      "dbNumber": 65,
      "dataType": "Bool",
      "offset": 0.1,
      "type": "plc_control",
      "startValue": false,
      "value": false
    },
    {
      "name": "Start_Chung",
      "dbNumber": 65,
      "dataType": "Bool",
      "offset": 0.2,
      "type": "plc_control",
      "startValue": false,
      "value": false
    },
    {
      "name": "Stop_Nhanh_1",
      "dbNumber": 65,
      "dataType": "Bool",
      "offset": 0.3,
      "type": "plc_control",
      "startValue": false,
      "value": false
    },
    {
      "name": "Stop_Nhanh_2",
      "dbNumber": 65,
      "dataType": "Bool",
      "offset": 0.4,
      "type": "plc_control",
      "startValue": false,
      "value": false
    },
    {
      "name": "Estop_1",
      "dbNumber": 65,
      "dataType": "Bool",
      "offset": 0.5,
      "type": "plc_control",
      "startValue": false,
      "value": false
    },
    {
      "name": "Estop_2",
      "dbNumber": 65,
      "dataType": "Bool",
      "offset": 0.6,
      "type": "plc_control",
      "startValue": false,
      "value": false
    },
    {
      "name": "Washing_No_Washsing",
      "dbNumber": 65,
      "dataType": "Bool",
      "offset": 0.7,
      "type": "plc_control",
      "startValue": false,
      "value": false
    },
    {
      "name": "Treo_Quay",
      "dbNumber": 65,
      "dataType": "Bool",
      "offset": 1.0,
      "type": "plc_control",
      "startValue": false,
      "value": false
    }
  ]
  
  export const plcChecklistButtonConfig = [
    {
      "name": "Checklist_quat_tu_say_1",
      "dbNumber": 65,
      "dataType": "Bool",
      "offset": 1.4,
      "type": "plc_checklist_control",
      "startValue": false,
      "value": false
    },
    {
      "name": "Checklist_bom_rua_phun_ho_26",
      "dbNumber": 65,
      "dataType": "Bool",
      "offset": 1.5,
      "type": "plc_checklist_control",
      "startValue": false,
      "value": false
    },
    {
      "name": "Checklist_bom_loc_1_ho_5",
      "dbNumber": 65,
      "dataType": "Bool",
      "offset": 1.6,
      "type": "plc_checklist_control",
      "startValue": false,
      "value": false
    },
    {
      "name": "Checklist_bom_loc_2_ho_pre_21",
      "dbNumber": 65,
      "dataType": "Bool",
      "offset": 1.7,
      "type": "plc_checklist_control",
      "startValue": false,
      "value": false
    },
    {
      "name": "Checklist_bom_loc_3_ho_ma_23",
      "dbNumber": 65,
      "dataType": "Bool",
      "offset": 2.0,
      "type": "plc_checklist_control",
      "startValue": false,
      "value": false
    },
    {
      "name": "Checklist_bom_loc_4_ho_24",
      "dbNumber": 65,
      "dataType": "Bool",
      "offset": 2.1,
      "type": "plc_checklist_control",
      "startValue": false,
      "value": false
    },
    {
      "name": "Checklist_bom_khuay_1",
      "dbNumber": 65,
      "dataType": "Bool",
      "offset": 2.2,
      "type": "plc_checklist_control",
      "startValue": false,
      "value": false
    },
    {
      "name": "Checklist_quat_hut_thap_xlk",
      "dbNumber": 65,
      "dataType": "Bool",
      "offset": 2.3,
      "type": "plc_checklist_control",
      "startValue": false,
      "value": false
    },
    {
      "name": "Checklist_bom_nuoc_thap_xlk",
      "dbNumber": 65,
      "dataType": "Bool",
      "offset": 2.4,
      "type": "plc_checklist_control",
      "startValue": false,
      "value": false
    },
    {
      "name": "Checklist_may_thoi_khi",
      "dbNumber": 65,
      "dataType": "Bool",
      "offset": 2.5,
      "type": "plc_checklist_control",
      "startValue": false,
      "value": false
    },
    {
      "name": "Checklist_bom_tach_dau",
      "dbNumber": 65,
      "dataType": "Bool",
      "offset": 2.6,
      "type": "plc_checklist_control",
      "startValue": false,
      "value": false
    },
  ]


export const temperatureVariableControl = [
  {
    "name": "Nhiet_do_Washing",
    "dbNumber": 109,
    "dataType": "Real",
    "offset": 0.0,
    "type": "May_tinh_Nhiet_Muc",
    "startValue": 0.0,
    "value": 0.0,
    "tankId": 5
  },
  {
    "name": "Nhiet_do_Boiling_Degreasing",
    "dbNumber": 109,
    "dataType": "Real",
    "offset": 4.0,
    "type": "May_tinh_Nhiet_Muc",
    "startValue": 0.0,
    "value": 0.0,
    "tankId": 9
  },
  {
    "name": "Nhiet_do_Electro_Degreasing_1",
    "dbNumber": 109,
    "dataType": "Real",
    "offset": 8.0,
    "type": "May_tinh_Nhiet_Muc",
    "startValue": 0.0,
    "value": 0.0,
    "tankId": 13
  },
  {
    "name": "Nhiet_do_Electro_Degreasing_2",
    "dbNumber": 109,
    "dataType": "Real",
    "offset": 12.0,
    "type": "May_tinh_Nhiet_Muc",
    "startValue": 0.0,
    "value": 0.0,
    "tankId": 14
  },
  {
    "name": "Nhiet_do_Nickel_Plating_1",
    "dbNumber": 109,
    "dataType": "Real",
    "offset": 16.0,
    "type": "May_tinh_Nhiet_Muc",
    "startValue": 0.0,
    "value": 0.0,
    "tankId": 23
  },
  {
    "name": "Nhiet_do_Nickel_Plating_2",
    "dbNumber": 109,
    "dataType": "Real",
    "offset": 20.0,
    "type": "May_tinh_Nhiet_Muc",
    "startValue": 0.0,
    "value": 0.0,
    "tankId": 24
  },
  {
    "name": "Nhiet_do_Nickel_Plating_3",
    "dbNumber": 109,
    "dataType": "Real",
    "offset": 24.0,
    "type": "May_tinh_Nhiet_Muc",
    "startValue": 0.0,
    "value": 0.0,
    "tankId": 25
  },
  {
    "name": "Nhiet_do_Ultrasonic_Hot_Rinse",
    "dbNumber": 109,
    "dataType": "Real",
    "offset": 28.0,
    "type": "May_tinh_Nhiet_Muc",
    "startValue": 0.0,
    "value": 0.0,
    "tankId": 29
  },
  {
    "name": "Nhiet_do_Hot_Rinse",
    "dbNumber": 109,
    "dataType": "Real",
    "offset": 32.0,
    "type": "May_tinh_Nhiet_Muc",
    "startValue": 0.0,
    "value": 0.0,
    "tankId": 30
  },
  {
    "name": "Nhiet_do_Dryer_1",
    "dbNumber": 109,
    "dataType": "Real",
    "offset": 36.0,
    "type": "May_tinh_Nhiet_Muc",
    "startValue": 0.0,
    "value": 0.0,
    "tankId": 31
  },
  {
    "name": "Nhiet_do_cai_Washing",
    "dbNumber": 109,
    "dataType": "Int",
    "offset": 40.0,
    "type": "May_tinh_Nhiet_Muc",
    "startValue": 0,
    "value": 55
  },
  {
    "name": "Nhiet_do_cai_Boiling_Degreasing",
    "dbNumber": 109,
    "dataType": "Int",
    "offset": 42.0,
    "type": "May_tinh_Nhiet_Muc",
    "startValue": 0,
    "value": 55
  },
  {
    "name": "Nhiet_do_cai_Electro_Degreasing_1",
    "dbNumber": 109,
    "dataType": "Int",
    "offset": 44.0,
    "type": "May_tinh_Nhiet_Muc",
    "startValue": 0,
    "value": 55
  },
  {
    "name": "Nhiet_do_cai_Electro_Degreasing_2",
    "dbNumber": 109,
    "dataType": "Int",
    "offset": 46.0,
    "type": "May_tinh_Nhiet_Muc",
    "startValue": 0,
    "value": 55
  },
  {
    "name": "Nhiet_do_cai_Nickel_Plating_1",
    "dbNumber": 109,
    "dataType": "Int",
    "offset": 48.0,
    "type": "May_tinh_Nhiet_Muc",
    "startValue": 0,
    "value": 55
  },
  {
    "name": "Nhiet_do_cai_Nickel_Plating_2",
    "dbNumber": 109,
    "dataType": "Int",
    "offset": 50.0,
    "type": "May_tinh_Nhiet_Muc",
    "startValue": 0,
    "value": 55
  },
  {
    "name": "Nhiet_do_cai_Nickel_Plating_3",
    "dbNumber": 109,
    "dataType": "Int",
    "offset": 52.0,
    "type": "May_tinh_Nhiet_Muc",
    "startValue": 0,
    "value": 55
  },
  {
    "name": "Nhiet_do_cai_Ultrasonic_Hot_Rinse",
    "dbNumber": 109,
    "dataType": "Int",
    "offset": 54.0,
    "type": "May_tinh_Nhiet_Muc",
    "startValue": 0,
    "value": 55
  },
  {
    "name": "Nhiet_do_cai_Hot_Rinse",
    "dbNumber": 109,
    "dataType": "Int",
    "offset": 56.0,
    "type": "May_tinh_Nhiet_Muc",
    "startValue": 0,
    "value": 55
  },
  {
    "name": "Nhiet_do_cai_Dryer_1",
    "dbNumber": 109,
    "dataType": "Int",
    "offset": 58.0,
    "type": "May_tinh_Nhiet_Muc",
    "startValue": 0,
    "value": 55
  }
]

export const electricityVariableControl = [
  { "name": "Vi_tri_Electro_Degreasing_1",   "dbNumber": 155, "dataType": "Int", "offset": 0.0,  "type": "May_tinh_Chinh_luu_R", "startValue": 0, "value": 0, "tankId": 13 },
  { "name": "Vi_tri_Electro_Degreasing_2",   "dbNumber": 155, "dataType": "Int", "offset": 2.0,  "type": "May_tinh_Chinh_luu_R", "startValue": 0, "value": 0, "tankId": 14 },
  { "name": "Vi_tri_Pre_Nickel_Plating",     "dbNumber": 155, "dataType": "Int", "offset": 4.0,  "type": "May_tinh_Chinh_luu_R", "startValue": 0, "value": 0, "tankId": 21  },
  { "name": "Vi_tri_Nickel_Plating_1",       "dbNumber": 155, "dataType": "Int", "offset": 6.0,  "type": "May_tinh_Chinh_luu_R", "startValue": 0, "value": 0, "tankId": 23  },
  { "name": "Vi_tri_Nickel_Plating_2",       "dbNumber": 155, "dataType": "Int", "offset": 8.0,  "type": "May_tinh_Chinh_luu_R", "startValue": 0, "value": 0, "tankId": 24  },
  { "name": "Vi_tri_Nickel_Plating_3",       "dbNumber": 155, "dataType": "Int", "offset": 10.0, "type": "May_tinh_Chinh_luu_R", "startValue": 0, "value": 0, "tankId": 25  },

  { "name": "Cai_chinh_luu_Electro_Degreasing_1", "dbNumber": 155, "dataType": "Int", "offset": 32.0, "type": "May_tinh_Chinh_luu_R", "startValue": 0, "value": 60 },
  { "name": "Cai_chinh_luu_Electro_Degreasing_2", "dbNumber": 155, "dataType": "Int", "offset": 34.0, "type": "May_tinh_Chinh_luu_R", "startValue": 0, "value": 60 },
  { "name": "Cai_chinh_luu_Pre_Nickel_Plating",   "dbNumber": 155, "dataType": "Int", "offset": 36.0, "type": "May_tinh_Chinh_luu_R", "startValue": 0, "value": 60 },
  { "name": "Cai_chinh_luu_Nickel_Plating_1",     "dbNumber": 155, "dataType": "Int", "offset": 38.0, "type": "May_tinh_Chinh_luu_R", "startValue": 0, "value": 60 },
  { "name": "Cai_chinh_luu_Nickel_Plating_2",     "dbNumber": 155, "dataType": "Int", "offset": 40.0, "type": "May_tinh_Chinh_luu_R", "startValue": 0, "value": 60 },
  { "name": "Cai_chinh_luu_Nickel_Plating_3",     "dbNumber": 155, "dataType": "Int", "offset": 42.0, "type": "May_tinh_Chinh_luu_R", "startValue": 0, "value": 60 },

  { "name": "Thoi_gian_tang_Electro_Degreasing_1","dbNumber": 155, "dataType": "Int", "offset": 64.0, "type": "May_tinh_Chinh_luu_R", "startValue": 0, "value": 0 },
  { "name": "Thoi_gian_tang_Electro_Degreasing_2","dbNumber": 155, "dataType": "Int", "offset": 66.0, "type": "May_tinh_Chinh_luu_R", "startValue": 0, "value": 0 },
  { "name": "Thoi_gian_tang_Pre_Nickel_Plating",  "dbNumber": 155, "dataType": "Int", "offset": 68.0, "type": "May_tinh_Chinh_luu_R", "startValue": 0, "value": 0 },
  { "name": "Thoi_gian_tang_Nickel_Plating_1",    "dbNumber": 155, "dataType": "Int", "offset": 70.0, "type": "May_tinh_Chinh_luu_R", "startValue": 0, "value": 0 },
  { "name": "Thoi_gian_tang_Nickel_Plating_2",    "dbNumber": 155, "dataType": "Int", "offset": 72.0, "type": "May_tinh_Chinh_luu_R", "startValue": 0, "value": 0 },
  { "name": "Thoi_gian_tang_Nickel_Plating_3",    "dbNumber": 155, "dataType": "Int", "offset": 74.0, "type": "May_tinh_Chinh_luu_R", "startValue": 0, "value": 0 }
]

export const settingTemperatureControl = [
  {
    "name": "Cai_nhiet_do_Washing",
    "dbNumber": 82,
    "dataType": "Int",
    "offset": 0.0,
    "type": "May_tinh_Cai_Nhiet",
    "startValue": 0,
    "value": 0
  },
  {
    "name": "Cai_nhiet_do_Boiling_Degreasing",
    "dbNumber": 82,
    "dataType": "Int",
    "offset": 2.0,
    "type": "May_tinh_Cai_Nhiet",
    "startValue": 0,
    "value": 0
  },
  {
    "name": "Cai_nhiet_do_Electro_Degreasing_1",
    "dbNumber": 82,
    "dataType": "Int",
    "offset": 4.0,
    "type": "May_tinh_Cai_Nhiet",
    "startValue": 0,
    "value": 0
  },
  {
    "name": "Cai_nhiet_do_Electro_Degreasing_2",
    "dbNumber": 82,
    "dataType": "Int",
    "offset": 6.0,
    "type": "May_tinh_Cai_Nhiet",
    "startValue": 0,
    "value": 0
  },
  {
    "name": "Cai_nhiet_do_Nickel_Plating_1",
    "dbNumber": 82,
    "dataType": "Int",
    "offset": 8.0,
    "type": "May_tinh_Cai_Nhiet",
    "startValue": 0,
    "value": 0
  },
  {
    "name": "Cai_nhiet_do_Nickel_Plating_2",
    "dbNumber": 82,
    "dataType": "Int",
    "offset": 10.0,
    "type": "May_tinh_Cai_Nhiet",
    "startValue": 0,
    "value": 0
  },
  {
    "name": "Cai_nhiet_do_Nickel_Plating_3",
    "dbNumber": 82,
    "dataType": "Int",
    "offset": 12.0,
    "type": "May_tinh_Cai_Nhiet",
    "startValue": 0,
    "value": 0
  },
  {
    "name": "Cai_nhiet_do_Ultrasonic_Hot_Rinse",
    "dbNumber": 82,
    "dataType": "Int",
    "offset": 14.0,
    "type": "May_tinh_Cai_Nhiet",
    "startValue": 0,
    "value": 0
  },
  {
    "name": "Cai_nhiet_do_Hot_Rinse",
    "dbNumber": 82,
    "dataType": "Int",
    "offset": 16.0,
    "type": "May_tinh_Cai_Nhiet",
    "startValue": 0,
    "value": 0
  },
  {
    "name": "Cai_nhiet_do_Dryer_1",
    "dbNumber": 82,
    "dataType": "Int",
    "offset": 18.0,
    "type": "May_tinh_Cai_Nhiet",
    "startValue": 0,
    "value": 0
  }
]



export const carrierVariableInformation = [
  {
    "name": "Carrier_Ma_vao_1",
    "dbNumber": 109,
    "dataType": "Real",
    "offset": 108.0,
    "type": "May_tinh_PLC_Send_Carrier",
    "startValue": 0.0,
    "value": 0.0
  },
  {
    "name": "Carrier_Ma_ra_1",
    "dbNumber": 109,
    "dataType": "Real",
    "offset": 112.0,
    "type": "May_tinh_PLC_Send_Carrier",
    "startValue": 0.0,
    "value": 0.0
  },
  {
    "name": "Carrier_Ma_vao_2",
    "dbNumber": 109,
    "dataType": "Real",
    "offset": 116.0,
    "type": "May_tinh_PLC_Send_Carrier",
    "startValue": 0.0,
    "value": 0.0
  },
  {
    "name": "Carrier_Ma_ra_2",
    "dbNumber": 109,
    "dataType": "Real",
    "offset": 120.0,
    "type": "May_tinh_PLC_Send_Carrier",
    "startValue": 0.0,
    "value": 0.0
  },
  {
    "name": "Carrier_Ma_vao_3",
    "dbNumber": 109,
    "dataType": "Real",
    "offset": 124.0,
    "type": "May_tinh_PLC_Send_Carrier",
    "startValue": 0.0,
    "value": 0.0
  },
  {
    "name": "Carrier_Ma_ra_3",
    "dbNumber": 109,
    "dataType": "Real",
    "offset": 128.0,
    "type": "May_tinh_PLC_Send_Carrier",
    "startValue": 0.0,
    "value": 0.0
  },
  {
    "name": "Carrier_Ma_1",
    "dbNumber": 109,
    "dataType": "Real",
    "offset": 132.0,
    "type": "May_tinh_PLC_Send_Carrier",
    "startValue": 0.0,
    "value": 0.0
  },
  {
    "name": "Carrier_Ma_2",
    "dbNumber": 109,
    "dataType": "Real",
    "offset": 136.0,
    "type": "May_tinh_PLC_Send_Carrier",
    "startValue": 0.0,
    "value": 0.0
  },
  {
    "name": "Carrier_Ma_3",
    "dbNumber": 109,
    "dataType": "Real",
    "offset": 140.0,
    "type": "May_tinh_PLC_Send_Carrier",
    "startValue": 0.0,
    "value": 0.0
  },
  {
    "name": "Ho_Ma_vao_1",
    "oldName": "Ho_Ma_1",
    "dbNumber": 109,
    "dataType": "Int",
    "offset": 144.0,
    "type": "May_tinh_PLC_Send_Carrier",
    "startValue": 0,
    "value": 0
  },
  {
    "name": "Ho_Ma_vao_2",
    "oldName": "Ho_Ma_2",
    "dbNumber": 109,
    "dataType": "Int",
    "offset": 146.0,
    "type": "May_tinh_PLC_Send_Carrier",
    "startValue": 0,
    "value": 0
  },
  {
    "name": "Ho_Ma_vao_3",
    "oldName": "Ho_Ma_3",
    "dbNumber": 109,
    "dataType": "Int",
    "offset": 148.0,
    "type": "May_tinh_PLC_Send_Carrier",
    "startValue": 0,
    "value": 0
  },
  {
    "name": "Ho_Ma_ra_1",
    "dbNumber": 109,
    "dataType": "Int",
    "offset": 150.0,
    "type": "May_tinh_PLC_Send_Carrier",
    "startValue": 0,
    "value": 0
  },
  {
    "name": "Ho_Ma_ra_2",
    "dbNumber": 109,
    "dataType": "Int",
    "offset": 152.0,
    "type": "May_tinh_PLC_Send_Carrier",
    "startValue": 0,
    "value": 0
  },
  {
    "name": "Ho_Ma_ra_3",
    "dbNumber": 109,
    "dataType": "Int",
    "offset": 154.0,
    "type": "May_tinh_PLC_Send_Carrier",
    "startValue": 0,
    "value": 0
  } 
]

// Setting timer 
export const settingTimerControl = [
  {
    "name": "may_tinh_Ghi_CPU_Thoi_gian_Ho_5",
    "dbNumber": 259,
    "dataType": "Int",
    "offset": 16,
    "type": "may_tinh_Ghi_CPU_setting_timer",
    "startValue": 0,
    "value": 0,
    "tankId" : 5
  },
  {
    "name": "may_tinh_Ghi_CPU_Thoi_gian_Ho_9",
    "dbNumber": 259,
    "dataType": "Int",
    "offset": 18,
    "type": "may_tinh_Ghi_CPU_setting_timer",
    "startValue": 0,
    "value": 0,
    "tankId" : 9
  },
  {
    "name": "may_tinh_Ghi_CPU_Thoi_gian_Ho_13",
    "dbNumber": 259,
    "dataType": "Int",
    "offset": 20,
    "type": "may_tinh_Ghi_CPU_setting_timer",
    "startValue": 0,
    "value": 0,
    "tankId" : 13
  },
  {
    "name": "may_tinh_Ghi_CPU_Thoi_gian_Ho_14",
    "dbNumber": 259,
    "dataType": "Int",
    "offset": 22,
    "type": "may_tinh_Ghi_CPU_setting_timer",
    "startValue": 0,
    "value": 0,
    "tankId" : 14
  },
  {
    "name": "may_tinh_Ghi_CPU_Thoi_gian_Ho_20",
    "dbNumber": 259,
    "dataType": "Int",
    "offset": 24,
    "type": "may_tinh_Ghi_CPU_setting_timer",
    "startValue": 0,
    "value": 0,
    "tankId" : 20
  },
  {
    "name": "may_tinh_Ghi_CPU_Thoi_gian_Ho_21",
    "dbNumber": 259,
    "dataType": "Int",
    "offset": 26,
    "type": "may_tinh_Ghi_CPU_setting_timer",
    "startValue": 0,
    "value": 0,
    "tankId" : 21
  },
  {
    "name": "may_tinh_Ghi_CPU_Thoi_gian_Ho_23",
    "dbNumber": 259,
    "dataType": "Int",
    "offset": 28,
    "type": "may_tinh_Ghi_CPU_setting_timer",
    "startValue": 0,
    "value": 0,
    "tankId" : 23
  },
  {
    "name": "may_tinh_Ghi_CPU_Thoi_gian_Ho_24",
    "dbNumber": 259,
    "dataType": "Int",
    "offset": 30,
    "type": "may_tinh_Ghi_CPU_setting_timer",
    "startValue": 0,
    "value": 0,
    "tankId" : 24
  },
  {
    "name": "may_tinh_Ghi_CPU_Thoi_gian_Ho_25",
    "dbNumber": 259,
    "dataType": "Int",
    "offset": 32,
    "type": "may_tinh_Ghi_CPU_setting_timer",
    "startValue": 0,
    "value": 0,
    "tankId" : 25,
    "disable": true
  },
  {
    "name": "may_tinh_Ghi_CPU_Thoi_gian_Ho_29",
    "dbNumber": 259,
    "dataType": "Int",
    "offset": 34,
    "type": "may_tinh_Ghi_CPU_setting_timer",
    "startValue": 0,
    "value": 0,
    "tankId" : 29
  },
  {
    "name": "may_tinh_Ghi_CPU_Thoi_gian_Ho_31",
    "dbNumber": 259,
    "dataType": "Int",
    "offset": 36,
    "type": "may_tinh_Ghi_CPU_setting_timer",
    "startValue": 0,
    "value": 0,
    "tankId" : 31
  },
]

/**
 * Quet the setting thoi gian, dong dien cho san pham ( card scanner)
 */
export const cardScannerCPUWriterControl = [
  {
    "name": "May_tinh_Ghi_CPU_Dong_Tay_dien_13",
    "dbNumber": 259,
    "dataType": "Int",
    "offset": 0.0,
    "type": "May_tinh_Ghi_CPU_setting_product",
    "startValue": 0,
    "value": 0
  },
  {
    "name": "May_tinh_Ghi_CPU_Dong_Tay_dien_14",
    "dbNumber": 259,
    "dataType": "Int",
    "offset": 2.0,
    "type": "May_tinh_Ghi_CPU_setting_product",
    "startValue": 0,
    "value": 0
  },
  {
    "name": "May_tinh_Ghi_CPU_Thoi_gian_tang_tay_14",
    "dbNumber": 259,
    "dataType": "Int",
    "offset": 4.0,
    "type": "May_tinh_Ghi_CPU_setting_product",
    "startValue": 0,
    "value": 0
  },
  {
    "name": "May_tinh_Ghi_CPU_Thoi_gian_tang_tay_13",
    "dbNumber": 259,
    "dataType": "Int",
    "offset": 6.0,
    "type": "May_tinh_Ghi_CPU_setting_product",
    "startValue": 0,
    "value": 0
  },
  {
    "name": "May_tinh_Ghi_CPU_Dong_Ma_Ni_21",
    "dbNumber": 259,
    "dataType": "Int",
    "offset": 8.0,
    "type": "May_tinh_Ghi_CPU_setting_product",
    "startValue": 0,
    "value": 0
  },
  {
    "name": "May_tinh_Ghi_CPU_Thoi_gian_tang_21",
    "dbNumber": 259,
    "dataType": "Int",
    "offset": 10.0,
    "type": "May_tinh_Ghi_CPU_setting_product",
    "startValue": 0,
    "value": 0
  },
  {
    "name": "May_tinh_Ghi_CPU_Dong_Ma_Ni_22_24",
    "dbNumber": 259,
    "dataType": "Int",
    "offset": 12.0,
    "type": "May_tinh_Ghi_CPU_setting_product",
    "startValue": 0,
    "value": 0
  },
  {
    "name": "May_tinh_Ghi_CPU_Thoi_gian_tang_22_24",
    "dbNumber": 259,
    "dataType": "Int",
    "offset": 14.0,
    "type": "May_tinh_Ghi_CPU_setting_product",
    "startValue": 0,
    "value": 0
  },

]

/**
 * Bo sung hoa chat
 * parameters-setting/chemistry
 */
export const boSungHoaChatControl = [
  {
    "name": "May_tinh_ Bosunghoachat_Dong_Nickel_23",
    "dbNumber": 267,
    "dataType": "LReal",
    "offset": 0.0,
    "type": "May_tinh_Bosunghoachat",
    "startValue": 0.0,
    "value": 0.0
  },
  {
    "name": "May_tinh_ Bosunghoachat_Dong_Nickel_24",
    "dbNumber": 267,
    "dataType": "LReal",
    "offset": 8.0,
    "type": "May_tinh_Bosunghoachat",
    "startValue": 0.0,
    "value": 0.0
  },
  {
    "name": "May_tinh_ Bosunghoachat_Dong_Nickel_25",
    "dbNumber": 267,
    "dataType": "LReal",
    "offset": 16.0,
    "type": "May_tinh_Bosunghoachat",
    "startValue": 0.0,
    "value": 0.0,
    "disable": true
  },
  {
    "name": "May_tinh_ Bosunghoachat_Dong_bosung_Nickel_23",
    "dbNumber": 267,
    "dataType": "LReal",
    "offset": 24.0,
    "type": "May_tinh_Bosunghoachat",
    "startValue": 0.0,
    "value": 0.0
  },
  {
    "name": "May_tinh_ Bosunghoachat_Dong_bosung_Nickel_24",
    "dbNumber": 267,
    "dataType": "LReal",
    "offset": 32.0,
    "type": "May_tinh_Bosunghoachat",
    "startValue": 0.0,
    "value": 0.0
  },
  {
    "name": "May_tinh_ Bosunghoachat_Dong_bosung_Nickel_25",
    "dbNumber": 267,
    "dataType": "LReal",
    "offset": 40.0,
    "type": "May_tinh_Bosunghoachat",
    "startValue": 0.0,
    "value": 0.0,
    "disable": true
  },
  {
    "name": "May_tinh_ Bosunghoachat_Thoi_gian_bom_Auto_1_23",
    "dbNumber": 267,
    "dataType": "DInt",
    "offset": 48.0,
    "type": "May_tinh_Bosunghoachat",
    "startValue": 0,
    "value": 0
  },
  {
    "name": "May_tinh_ Bosunghoachat_Thoi_gian_bom_Auto_2_23",
    "dbNumber": 267,
    "dataType": "DInt",
    "offset": 52.0,
    "type": "May_tinh_Bosunghoachat",
    "startValue": 0,
    "value": 0
  },
  {
    "name": "May_tinh_ Bosunghoachat_Thoi_gian_bom_Auto_1_24",
    "dbNumber": 267,
    "dataType": "DInt",
    "offset": 56.0,
    "type": "May_tinh_Bosunghoachat",
    "startValue": 0,
    "value": 0
  },
  {
    "name": "May_tinh_ Bosunghoachat_Thoi_gian_bom_Auto_2_24",
    "dbNumber": 267,
    "dataType": "DInt",
    "offset": 60.0,
    "type": "May_tinh_Bosunghoachat",
    "startValue": 0,
    "value": 0
  },
  {
    "name": "May_tinh_ Bosunghoachat_Thoi_gian_bom_Auto_1_25",
    "dbNumber": 267,
    "dataType": "DInt",
    "offset": 64.0,
    "type": "May_tinh_Bosunghoachat",
    "startValue": 0,
    "value": 0,
    "disable": true
  },
  {
    "name": "May_tinh_ Bosunghoachat_Thoi_gian_bom_Auto_2_25",
    "dbNumber": 267,
    "dataType": "DInt",
    "offset": 68.0,
    "type": "May_tinh_Bosunghoachat",
    "startValue": 0,
    "value": 0,
    "disable": true
  },
  {
    "name": "May_tinh_ Bosunghoachat_Thoi_gian_bom_Nickel_23",
    "dbNumber": 267,
    "dataType": "DInt",
    "offset": 72.0,
    "type": "May_tinh_Bosunghoachat",
    "startValue": 0,
    "value": 0
  },
  {
    "name": "May_tinh_ Bosunghoachat_Thoi_gian_bom_Nickel_24",
    "dbNumber": 267,
    "dataType": "DInt",
    "offset": 76.0,
    "type": "May_tinh_Bosunghoachat",
    "startValue": 0,
    "value": 0
  },
  {
    "name": "May_tinh_ Bosunghoachat_Thoi_gian_bom_Nickel_25",
    "dbNumber": 267,
    "dataType": "DInt",
    "offset": 80.0,
    "type": "May_tinh_Bosunghoachat",
    "startValue": 0,
    "value": 0,
    "disable": true
  },
  {
    "name": "May_tinh_ Bosunghoachat_Thoi_gian_bom_9",
    "dbNumber": 267,
    "dataType": "DInt",
    "offset": 84.0,
    "type": "May_tinh_Bosunghoachat",
    "startValue": 0,
    "value": 0
  },
  {
    "name": "May_tinh_ Bosunghoachat_Thoi_gian_bom_13",
    "dbNumber": 267,
    "dataType": "DInt",
    "offset": 88.0,
    "type": "May_tinh_Bosunghoachat",
    "startValue": 0,
    "value": 0
  },
  {
    "name": "May_tinh_ Bosunghoachat_Thoi_gian_bom_14",
    "dbNumber": 267,
    "dataType": "DInt",
    "offset": 92.0,
    "type": "May_tinh_Bosunghoachat",
    "startValue": 0,
    "value": 0
  },

]
