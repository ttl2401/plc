"use client";

import React, { useState } from 'react';
import { Button, Switch, Card, Row, Col, Typography } from 'antd';
import { PoweroffOutlined } from '@ant-design/icons';
import { useLanguage } from '@/components/layout/DashboardLayout';
import GaugeButton from "@/components/GaugeButton";
import SlidePopup from './SlidePopup';

const { Title } = Typography;

const RobotControlPage = () => {
  const { t } = useLanguage();
  const [emergency1Active, setEmergency1Active] = useState(true); // true = stopped/red, false = active/inactive
  const [emergency2Active, setEmergency2Active] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<number>(1);


  return (
    <div style={{ minHeight: '100vh', background: '#f5f6fa', padding: 24 }}>
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ marginBottom: 0 }}>{t('robot_control_title')}</Title>
      </div>
      <Row gutter={32}>
        {/* Left: Nút nhấn nhả & ON/OFF khẩn cấp */}
        <Col xs={24} md={14}>
          <Card
            title={<div style={{ fontWeight: 600 }}>{t('robot_control_push_buttons')}</div>}
            style={{ marginBottom: 24 }}
            variant="outlined"
          >
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col xs={24} md={8}>
                <Card className="bg-green-100" styles={{ body: { padding: 16, textAlign: 'center', minHeight: 160 } }} variant="borderless">
                  <div className="mb-2 font-semibold">{t('robot_control_start_all')}</div>
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      border: "4px solid limegreen",
                      background: "limegreen",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all 0.3s",
                      margin: "0 auto"
                    }}
                  >
                    <PoweroffOutlined
                      style={{
                        fontSize: 26,
                        color: "#fff"
                      }}
                    />
                  </div>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card className="bg-green-100" styles={{ body: { padding: 16, textAlign: 'center', minHeight: 160 } }} variant="borderless">
                  <div className="mb-2 font-semibold">{t('robot_control_start_branch1')}</div>
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      border: "4px solid limegreen",
                      background: "limegreen",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all 0.3s",
                      margin: "0 auto"
                    }}
                  >
                    <PoweroffOutlined
                      style={{
                        fontSize: 26,
                        color: "#fff"
                      }}
                    />
                  </div>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card className="bg-green-100" styles={{ body: { padding: 16, textAlign: 'center', minHeight: 160 } }} variant="borderless">
                  <div className="mb-2 font-semibold">{t('robot_control_start_branch2')}</div>
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      border: "4px solid limegreen",
                      background: "limegreen",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all 0.3s",
                      margin: "0 auto"
                    }}
                  >
                    <PoweroffOutlined
                      style={{
                        fontSize: 26,
                        color: "#fff"
                      }}
                    />
                  </div>
                </Card>
              </Col>
            </Row>
            <Row gutter={16} justify="end">
              <Col xs={12} md={8}>
                <Card className="bg-red-100" styles={{ body: { padding: 16, textAlign: 'center', minHeight: 160 } }}
                 variant="borderless">
                  <div className="mb-2 font-semibold">{t('robot_control_delete_memory_branch1')}</div>
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      border: "4px solid #ff4d4f",
                      background: "#ff4d4f",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all 0.3s",
                      margin: "0 auto 8px auto"
                    }}
                  >
                    <PoweroffOutlined
                      style={{
                        fontSize: 26,
                        color: "#fff"
                      }}
                    />
                  </div>
                  <div className="mt-2 text-red-600 font-bold">{t('robot_control_pressed_seconds').replace('{seconds}', '6')}</div>
                </Card>
              </Col>
              <Col xs={12} md={8}>
                <Card className="bg-red-100" 
                styles={{ body: { padding: 16, textAlign: 'center', minHeight: 160 } }}
                variant="borderless">
                  <div className="mb-2 font-semibold">{t('robot_control_delete_memory_branch2')}</div>
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      border: "4px solid #ff4d4f",
                      background: "#ff4d4f",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all 0.3s",
                      margin: "0 auto"
                    }}
                  >
                    <PoweroffOutlined
                      style={{
                        fontSize: 26,
                        color: "#fff"
                      }}
                    />
                  </div>
                </Card>
              </Col>
            </Row>
          </Card>
          <Card
            title={<div style={{ fontWeight: 600 }}>ON/OFF {t('robot_control_emergency')}</div>}
            variant="outlined"
          >
            <Row gutter={16} justify="end">
              <Col xs={12} md={8}>
                <Card className="bg-red-100" 
                styles={{ body: { padding: 16, textAlign: 'center', minHeight: 160 } }}
                variant="borderless">
                  <div className="mb-2 font-semibold">{t('robot_control_emergency_branch1')}</div>
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      border: emergency1Active ? "4px solid #ff4d4f" : "4px solid #d9d9d9",
                      background: emergency1Active ? "#ff4d4f" : "#f5f5f5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: emergency1Active ? "pointer" : "not-allowed",
                      transition: "all 0.3s",
                      margin: "0 auto 8px auto",
                      opacity: emergency1Active ? 1 : 0.5
                    }}
                    onClick={() => {
                      if (emergency1Active) {
                        setSelectedBranch(1);
                        setShowPopup(true);
                      }
                    }}
                  >
                    <PoweroffOutlined
                      style={{
                        fontSize: 32,
                        color: emergency1Active ? "#fff" : "#999"
                      }}
                    />
                  </div>
                  <div className="mt-2 text-red-600 font-bold">
                    {emergency1Active ? t('robot_control_stopped') : t('robot_control_inactive')}
                  </div>
                </Card>
              </Col>
              <Col xs={12} md={8}>
                <Card className="bg-red-100"  
                styles={{ body: { padding: 16, textAlign: 'center', minHeight: 160 } }}
                variant="borderless">
                  <div className="mb-2 font-semibold">{t('robot_control_emergency_branch2')}</div>
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      border: emergency2Active ? "4px solid #ff4d4f" : "4px solid #d9d9d9",
                      background: emergency2Active ? "#ff4d4f" : "#f5f5f5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: emergency2Active ? "pointer" : "not-allowed",
                      transition: "all 0.3s",
                      margin: "0 auto 8px auto",
                      opacity: emergency2Active ? 1 : 0.5
                    }}
                    onClick={() => {
                      if (emergency2Active) {
                        setSelectedBranch(2);
                        setShowPopup(true);
                      }
                    }}
                  >
                    <PoweroffOutlined
                      style={{
                        fontSize: 32,
                        color: emergency2Active ? "#fff" : "#999"
                      }}
                    />
                  </div>
                  <div className="mt-2 text-red-600 font-bold">
                    {emergency2Active ? t('robot_control_stopped') : t('robot_control_inactive')}
                  </div>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
        {/* Right: Nút Switch */}
        <Col xs={24} md={10}>
          <Card
            title={<div style={{ fontWeight: 600 }}>{t('robot_control_switch_buttons')}</div>}
            variant="outlined"
          >
            <Row gutter={16} justify="end">
              <Col xs={24} md={12} style={{ paddingBottom: 16 }}>
                <Card className="bg-gray-50" 
                styles={{ body: { padding: 16, textAlign: 'center' } }}
                variant="outlined"
                style={{ border: '2px solid #d9d9d9', borderRadius: '8px' }}>
                  <GaugeButton
                    checked={true}
                    label={t('robot_control_suspended_rotate')}
                    value={t('robot_control_rotate')}
                    leftLabel={t('robot_control_rotate')}
                    rightLabel={t('robot_control_suspended')}
                  />
                </Card>
              </Col>
              <Col xs={24} md={12} style={{ paddingBottom: 16 }}>
                <Card className="bg-gray-50" styles={{ body: { padding: 16, textAlign: 'center' } }} 
                variant="outlined"
                style={{ border: '2px solid #d9d9d9', borderRadius: '8px' }}>
                  <GaugeButton
                    checked={false}
                    label={t('robot_control_electro')}
                    value={t('robot_control_electro_2')}
                    leftLabel={t('robot_control_electro_2')}
                    rightLabel={t('robot_control_electro_1')}
                  />
                </Card>
              </Col>
              <Col xs={24} md={12} style={{ paddingBottom: 16 }}>
                <Card className="bg-gray-50" styles={{ body: { padding: 16, textAlign: 'center' } }} 
                variant="outlined"
                style={{ border: '2px solid #d9d9d9', borderRadius: '8px' }}>
                  <GaugeButton
                    checked={true}
                    label={t('robot_control_washing')}
                    value={t('robot_control_washing_yes')}
                    leftLabel={t('robot_control_washing_yes')}
                    rightLabel={t('robot_control_washing_no')}
                  />
                </Card>
              </Col>
              <Col xs={24} md={12} style={{ paddingBottom: 16 }}>
                <Card className="bg-gray-50" styles={{ body: { padding: 16, textAlign: 'center' } }} 
                variant="outlined"
                style={{ border: '2px solid #d9d9d9', borderRadius: '8px' }}>
                  <GaugeButton
                    checked={true}
                    label={t('robot_control_load_goods')}
                    value={t('robot_control_load_look')}
                    leftLabel={t('robot_control_load_look')}
                    rightLabel={t('robot_control_load_no')}
                  />
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
      
      {/* Slide Popup */}
      <SlidePopup
        visible={showPopup}
        onClose={() => setShowPopup(false)}
        onConfirm={() => {
          if (selectedBranch === 1) {
            setEmergency1Active(false);
          } else {
            setEmergency2Active(false);
          }
          setShowPopup(false);
        }}
        branchNumber={selectedBranch}
      />
    </div>
  );
};

export default RobotControlPage; 