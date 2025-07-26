"use client";

import { useState } from "react";
import { Card, Checkbox, Button, Row, Col, Typography } from "antd";
import { PoweroffOutlined } from "@ant-design/icons"; // Ant Design icon
import { useLanguage } from '@/components/layout/DashboardLayout';

const { Title } = Typography;

const Index = () => {
  const { t } = useLanguage();
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
  const [machineStates, setMachineStates] = useState<Record<string, boolean>>({
    airSuction: false,
    airCompressor: false,
    washingFilter: false,
    preNickelPlating: true,
    nickelPlating1: false,
    nickelPlating2: false,
    nickelPlating3: false,
    circulationPump: true,
  });

  const checklistItems = [
    { id: 1, text: t('plc_check_air_suction') },
    { id: 2, text: t('plc_check_air_compressor') },
    { id: 3, text: t('plc_check_washing_filter') },
    { id: 4, text: t('plc_check_pre_nickel_plating') },
    { id: 5, text: t('plc_check_nickel_plating_1') },
    { id: 6, text: t('plc_check_nickel_plating_2') },
    { id: 7, text: t('plc_check_nickel_plating_3') },
    { id: 8, text: t('plc_check_circulation_pump') },
    { id: 9, text: t('plc_check_temperature') },
    { id: 10, text: t('plc_check_valve') },
  ];

  const machines = [
    { id: "airSuction", name: t('plc_machine_air_suction'), color: "red" },
    { id: "airCompressor", name: t('plc_machine_air_compressor'), color: "red" },
    { id: "washingFilter", name: t('plc_machine_washing_filter'), color: "red" },
    { id: "preNickelPlating", name: t('plc_machine_pre_nickel_plating'), color: "black" },
    { id: "nickelPlating1", name: t('plc_machine_nickel_plating_1'), color: "red" },
    { id: "nickelPlating2", name: t('plc_machine_nickel_plating_2'), color: "red" },
    { id: "nickelPlating3", name: t('plc_machine_nickel_plating_3'), color: "red" },
    { id: "circulationPump", name: t('plc_machine_circulation_pump'), color: "black" },
  ];

  const handleCheckboxChange = (id: number, checked: boolean) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: checked
    }));
  };

  const handleMachineToggle = (machineId: string) => {
    setMachineStates(prev => ({
      ...prev,
      [machineId]: !prev[machineId]
    }));
  };

  const resetChecklist = () => {
    setCheckedItems({});
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f6fa", padding: 24 }}>
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ marginBottom: 0 }}>{t('plc_checklist_title')}</Title>
      </div>
      <Row gutter={32}>
        {/* Checklist (1/3 width) */}
        <Col xs={24} md={8}>
          <Card
            title={
              <div style={{ textAlign: "center", fontWeight: 600 }}>{t('plc_checklist_card_title')}</div>
            }
            variant="outlined"
          >
            {checklistItems.map(item => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: checkedItems[item.id] ? "#e6fffb" : undefined,
                  borderRadius: 8,
                  padding: "8px 10px",
                  marginBottom: 4,
                  transition: "background 0.3s"
                }}
              >
                <span style={{ width: 24, textAlign: "center", color: "#888" }}>{item.id}</span>
                <span
                  style={{
                    flex: 1,
                    marginLeft: 8,
                    color: checkedItems[item.id] ? "#389e0d" : "#222",
                    fontWeight: checkedItems[item.id] ? 600 : 400,
                    fontSize: 14,
                  }}
                >
                  {item.text}
                </span>
                <Checkbox
                  checked={checkedItems[item.id] || false}
                  onChange={e => handleCheckboxChange(item.id, e.target.checked)}
                  style={{ marginLeft: 12 }}
                />
              </div>
            ))}
            <Button onClick={resetChecklist} style={{ marginTop: 12 }} block>
              {t('plc_reset_checklist')}
            </Button>
          </Card>
        </Col>
        {/* Machine Controls (2/3 width) */}
        <Col xs={24} md={16}>
          <Card
            title={
              <div style={{ textAlign: "center", fontWeight: 600 }}>{t('plc_control_switch_title')}</div>
            }
            variant="outlined"
          >
            <Row gutter={[16, 16]}>
              {machines.map(machine => (
                <Col xs={24} sm={12} lg={8} key={machine.id}>
                  <Card
                    hoverable
                    onClick={() => handleMachineToggle(machine.id)}
                    className={machineStates[machine.id] ? 'bg-green-100' : ''}
                    style={{
                      borderColor: machineStates[machine.id] ? "limegreen" : "#f0f0f0",
                      cursor: "pointer",
                      transition: "all 0.3s"
                    }}
   
                    styles={{ body: { padding: 20, textAlign: "center" } }}
                  >
                    <div style={{ fontWeight: 500, color: machine.color === "red" ? "#ff4d4f" : "#222", marginBottom: 12 }}>
                      {machine.name}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: "50%",
                          border: `4px solid ${machineStates[machine.id] ? "limegreen" : "#d9d9d9"}`,
                          background: machineStates[machine.id] ? "limegreen" : "#f5f6fa",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: 8,
                          transition: "all 0.3s"
                        }}
                      >
                        <PoweroffOutlined
                          style={{
                            fontSize: 26,
                            color: machineStates[machine.id] ? "#fff" : "#aaa"
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: machineStates[machine.id] ? "limegreen" : "#bbb"
                        }}
                      >
                        {machineStates[machine.id] ? t('plc_on') : t('plc_off')}
                      </span>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Index;
