"use client";

import React, { useState, useRef, useEffect } from 'react';
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

  // States for 5 buttons in "Nút nhấn nhả"
  const [startAllActive, setStartAllActive] = useState(true);
  const [startBranch1Active, setStartBranch1Active] = useState(true);
  const [startBranch2Active, setStartBranch2Active] = useState(true);
  const [deleteMemory1Active, setDeleteMemory1Active] = useState(false);
  const [deleteMemory2Active, setDeleteMemory2Active] = useState(false);

  // States for red button hold behavior
  const [deleteMemory1Pressing, setDeleteMemory1Pressing] = useState(false);
  const [deleteMemory2Pressing, setDeleteMemory2Pressing] = useState(false);
  const [deleteMemory1Count, setDeleteMemory1Count] = useState(0);
  const [deleteMemory2Count, setDeleteMemory2Count] = useState(0);
  
  const deleteMemory1Timer = useRef<NodeJS.Timeout | null>(null);
  const deleteMemory2Timer = useRef<NodeJS.Timeout | null>(null);

  // Handle red button press and hold logic
  const handleRedButtonPress = (buttonNumber: 1 | 2) => {
    console.log(`Button ${buttonNumber} pressed`); // Debug log
    
    if (buttonNumber === 1) {
      if (deleteMemory1Timer.current) {
        clearInterval(deleteMemory1Timer.current);
      }
      
      setDeleteMemory1Pressing(true);
      setDeleteMemory1Active(true); // Set to active when pressed
      setDeleteMemory1Count(1);
      
      deleteMemory1Timer.current = setInterval(() => {
        setDeleteMemory1Count(prev => {
          const newCount = prev + 1;
          console.log(`Button 1 count: ${newCount}`); // Debug log
          return newCount;
        });
      }, 1000);
    } else {
      if (deleteMemory2Timer.current) {
        clearInterval(deleteMemory2Timer.current);
      }
      
      setDeleteMemory2Pressing(true);
      setDeleteMemory2Active(true); // Set to active when pressed
      setDeleteMemory2Count(1);
      
      deleteMemory2Timer.current = setInterval(() => {
        setDeleteMemory2Count(prev => {
          const newCount = prev + 1;
          console.log(`Button 2 count: ${newCount}`); // Debug log
          return newCount;
        });
      }, 1000);
    }
  };

  const handleRedButtonRelease = (buttonNumber: 1 | 2) => {
    console.log(`Button ${buttonNumber} released`); // Debug log
    
    if (buttonNumber === 1) {
      setDeleteMemory1Pressing(false);
      setDeleteMemory1Active(false); // Set to inactive when released
      setDeleteMemory1Count(0);
      if (deleteMemory1Timer.current) {
        clearInterval(deleteMemory1Timer.current);
        deleteMemory1Timer.current = null;
      }
    } else {
      setDeleteMemory2Pressing(false);
      setDeleteMemory2Active(false); // Set to inactive when released
      setDeleteMemory2Count(0);
      if (deleteMemory2Timer.current) {
        clearInterval(deleteMemory2Timer.current);
        deleteMemory2Timer.current = null;
      }
    }
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (deleteMemory1Timer.current) clearInterval(deleteMemory1Timer.current);
      if (deleteMemory2Timer.current) clearInterval(deleteMemory2Timer.current);
    };
  }, []);


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
                <Card className="bg-green-100" styles={{ body: { padding: 16, textAlign: 'center', minHeight: 140, position: 'relative' } }} variant="borderless">
                  <div className="mb-2 font-semibold">{t('robot_control_start_all')}</div>
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      border: startAllActive ? "4px solid limegreen" : "4px solid #d9d9d9",
                      background: startAllActive ? "limegreen" : "#f5f5f5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all 0.3s",
                      margin: "0 auto"
                    }}
                    onClick={() => setStartAllActive(!startAllActive)}
                  >
                    <PoweroffOutlined
                      style={{
                        fontSize: 26,
                        color: startAllActive ? "#fff" : "#999"
                      }}
                    />
                  </div>
                  {/* <div style={{ position: 'absolute', bottom: 6, left: 0, right: 0 }} className="text-green-600 font-bold">
                    {startAllActive ? t('robot_control_active') : t('robot_control_inactive')}
                  </div> */}
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card className="bg-green-100" styles={{ body: { padding: 16, textAlign: 'center', minHeight: 140, position: 'relative' } }} variant="borderless">
                  <div className="mb-2 font-semibold">{t('robot_control_start_branch1')}</div>
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      border: startBranch1Active ? "4px solid limegreen" : "4px solid #d9d9d9",
                      background: startBranch1Active ? "limegreen" : "#f5f5f5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all 0.3s",
                      margin: "0 auto"
                    }}
                    onClick={() => setStartBranch1Active(!startBranch1Active)}
                  >
                    <PoweroffOutlined
                      style={{
                        fontSize: 26,
                        color: startBranch1Active ? "#fff" : "#999"
                      }}
                    />
                  </div>
                  {/* <div style={{ position: 'absolute', bottom: 6, left: 0, right: 0 }} className="text-green-600 font-bold">
                    {startBranch1Active ? t('robot_control_active') : t('robot_control_inactive')}
                  </div> */}
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card className="bg-green-100" styles={{ body: { padding: 16, textAlign: 'center', minHeight: 140, position: 'relative' } }} variant="borderless">
                  <div className="mb-2 font-semibold">{t('robot_control_start_branch2')}</div>
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      border: startBranch2Active ? "4px solid limegreen" : "4px solid #d9d9d9",
                      background: startBranch2Active ? "limegreen" : "#f5f5f5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all 0.3s",
                      margin: "0 auto"
                    }}
                    onClick={() => setStartBranch2Active(!startBranch2Active)}
                  >
                    <PoweroffOutlined
                      style={{
                        fontSize: 26,
                        color: startBranch2Active ? "#fff" : "#999"
                      }}
                    />
                  </div>
                  {/* <div style={{ position: 'absolute', bottom: 6, left: 0, right: 0 }} className="text-green-600 font-bold">
                    {startBranch2Active ? t('robot_control_active') : t('robot_control_inactive')}
                  </div> */}
                </Card>
              </Col>
            </Row>
            <Row gutter={16} justify="end">
              <Col xs={12} md={8}>
                <Card className="bg-red-100" styles={{ body: { padding: 16, textAlign: 'center', minHeight: 140, position: 'relative' } }}
                 variant="borderless">
                  <div className="mb-2 font-semibold">{t('robot_control_delete_memory_branch1')}</div>
                  <div
                    style={{
                      position: 'relative',
                      width: 68,
                      height: 68,
                      margin: "0 auto 8px auto"
                    }}
                  >
                    {/* Progress circle */}
                    {deleteMemory1Pressing && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: 68,
                          height: 68,
                          borderRadius: '50%',
                          background: `conic-gradient(#ff4d4f ${(deleteMemory1Count / 5) * 360}deg, transparent ${(deleteMemory1Count / 5) * 360}deg)`,
                          zIndex: 1
                        }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            top: 4,
                            left: 4,
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            background: '#f5f6fa'
                          }}
                        />
                      </div>
                    )}
                    
                    {/* Button */}
                    <div
                      style={{
                        position: 'relative',
                        top: 4,
                        left: 4,
                        width: 60,
                        height: 60,
                        borderRadius: "50%",
                        border: deleteMemory1Active ? "4px solid #ff4d4f" : "4px solid #d9d9d9",
                        background: deleteMemory1Active ? "#ff4d4f" : "#f5f5f5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "all 0.3s",
                        zIndex: 2
                      }}
                      onMouseDown={() => handleRedButtonPress(1)}
                      onMouseUp={() => handleRedButtonRelease(1)}
                      onTouchStart={() => handleRedButtonPress(1)}
                      onTouchEnd={() => handleRedButtonRelease(1)}
                    >
                      <PoweroffOutlined
                        style={{
                          fontSize: 26,
                          color: deleteMemory1Active ? "#fff" : "#999"
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ position: 'absolute', bottom: 6, left: 0, right: 0 }} className="text-red-600 font-bold">
                    {deleteMemory1Pressing ? 
                      t('robot_control_pressed_seconds').replace('{seconds}', deleteMemory1Count.toString()) : 
                      ''
                    }
                  </div>
                </Card>
              </Col>
              <Col xs={12} md={8}>
                <Card className="bg-red-100" 
                styles={{ body: { padding: 16, textAlign: 'center', minHeight: 140, position: 'relative' } }}
                variant="borderless">
                  <div className="mb-2 font-semibold">{t('robot_control_delete_memory_branch2')}</div>
                  <div
                    style={{
                      position: 'relative',
                      width: 68,
                      height: 68,
                      margin: "0 auto"
                    }}
                  >
                    {/* Progress circle */}
                    {deleteMemory2Pressing && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: 68,
                          height: 68,
                          borderRadius: '50%',
                          background: `conic-gradient(#ff4d4f ${(deleteMemory2Count / 5) * 360}deg, transparent ${(deleteMemory2Count / 5) * 360}deg)`,
                          zIndex: 1
                        }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            top: 4,
                            left: 4,
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            background: '#f5f6fa'
                          }}
                        />
                      </div>
                    )}
                    
                    {/* Button */}
                    <div
                      style={{
                        position: 'relative',
                        top: 4,
                        left: 4,
                        width: 60,
                        height: 60,
                        borderRadius: "50%",
                        border: deleteMemory2Active ? "4px solid #ff4d4f" : "4px solid #d9d9d9",
                        background: deleteMemory2Active ? "#ff4d4f" : "#f5f5f5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "all 0.3s",
                        zIndex: 2
                      }}
                      onMouseDown={() => handleRedButtonPress(2)}
                      onMouseUp={() => handleRedButtonRelease(2)}
                      onTouchStart={() => handleRedButtonPress(2)}
                      onTouchEnd={() => handleRedButtonRelease(2)}
                    >
                      <PoweroffOutlined
                        style={{
                          fontSize: 26,
                          color: deleteMemory2Active ? "#fff" : "#999"
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ position: 'absolute', bottom: 6, left: 0, right: 0 }} className="text-red-600 font-bold">
                    {deleteMemory2Pressing ? 
                      t('robot_control_pressed_seconds').replace('{seconds}', deleteMemory2Count.toString()) : 
                      ''
                    }
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
                styles={{ body: { padding: 16, textAlign: 'center', minHeight: 140, position: 'relative' } }}
                variant="borderless">
                  <div className="mb-2 font-semibold">{t('robot_control_emergency_branch1')}</div>
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      border: emergency1Active ? "4px solid #ff4d4f" : "4px solid #ff4d4f",
                      background: emergency1Active ? "#ff4d4f" : "#f5f5f5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all 0.3s",
                      margin: "0 auto 8px auto",
                      opacity: 1
                    }}
                    onClick={() => {
                      if (emergency1Active) {
                        setSelectedBranch(1);
                        setShowPopup(true);
                      } else {
                        setEmergency1Active(true);
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
                  <div style={{ position: 'absolute', bottom: 6, left: 0, right: 0 }} className="text-red-600 font-bold">
                    {emergency1Active ? t('robot_control_stopped') : ''}
                  </div>
                </Card>
              </Col>
              <Col xs={12} md={8}>
                <Card className="bg-red-100"  
                styles={{ body: { padding: 16, textAlign: 'center', minHeight: 140, position: 'relative' } }}
                variant="borderless">
                  <div className="mb-2 font-semibold">{t('robot_control_emergency_branch2')}</div>
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      border: emergency2Active ? "4px solid #ff4d4f" : "4px solid #ff4d4f",
                      background: emergency2Active ? "#ff4d4f" : "#f5f5f5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all 0.3s",
                      margin: "0 auto 8px auto",
                      opacity: 1
                    }}
                    onClick={() => {
                      if (emergency2Active) {
                        setSelectedBranch(2);
                        setShowPopup(true);
                      } else {
                        setEmergency2Active(true);
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
                  <div style={{ position: 'absolute', bottom: 6, left: 0, right: 0 }} className="text-red-600 font-bold">
                    {emergency2Active ? t('robot_control_stopped') : ''}
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