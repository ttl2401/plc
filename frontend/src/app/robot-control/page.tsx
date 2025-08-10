"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button, Switch, Card, Row, Col, Typography, Spin } from 'antd';
import { PoweroffOutlined, LoadingOutlined } from '@ant-design/icons';
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
  const [startAllActive, setStartAllActive] = useState(false);
  const [startBranch1Active, setStartBranch1Active] = useState(false);
  const [startBranch2Active, setStartBranch2Active] = useState(false);
  const [deleteMemory1Active, setDeleteMemory1Active] = useState(false);
  const [deleteMemory2Active, setDeleteMemory2Active] = useState(false);

  // States for red button hold behavior
  const [deleteMemory1Pressing, setDeleteMemory1Pressing] = useState(false);
  const [deleteMemory2Pressing, setDeleteMemory2Pressing] = useState(false);
  const [deleteMemory1Count, setDeleteMemory1Count] = useState(0);
  const [deleteMemory2Count, setDeleteMemory2Count] = useState(0);
  
  const deleteMemory1Timer = useRef<NodeJS.Timeout | null>(null);
  const deleteMemory2Timer = useRef<NodeJS.Timeout | null>(null);

  // States for green start button hold behavior
  const [startAllPressing, setStartAllPressing] = useState(false);
  const [startBranch1Pressing, setStartBranch1Pressing] = useState(false);
  const [startBranch2Pressing, setStartBranch2Pressing] = useState(false);
  const [startAllFlashing, setStartAllFlashing] = useState(false);
  const [startBranch1Flashing, setStartBranch1Flashing] = useState(false);
  const [startBranch2Flashing, setStartBranch2Flashing] = useState(false);
  
  const startAllTimer = useRef<NodeJS.Timeout | null>(null);
  const startBranch1Timer = useRef<NodeJS.Timeout | null>(null);
  const startBranch2Timer = useRef<NodeJS.Timeout | null>(null);

  // Handle red button press and hold logic
  const handleRedButtonPress = (buttonNumber: 1 | 2) => {
    if (buttonNumber === 1) {
      if (deleteMemory1Timer.current) clearInterval(deleteMemory1Timer.current);
      setDeleteMemory1Pressing(true);
      setDeleteMemory1Active(true);
      setDeleteMemory1Count(1);
      deleteMemory1Timer.current = setInterval(() => {
        setDeleteMemory1Count(prev => prev + 1);
      }, 1000);
    } else {
      if (deleteMemory2Timer.current) clearInterval(deleteMemory2Timer.current);
      setDeleteMemory2Pressing(true);
      setDeleteMemory2Active(true);
      setDeleteMemory2Count(1);
      deleteMemory2Timer.current = setInterval(() => {
        setDeleteMemory2Count(prev => prev + 1);
      }, 1000);
    }
  };

  const handleRedButtonRelease = (buttonNumber: 1 | 2) => {
    if (buttonNumber === 1) {
      setDeleteMemory1Pressing(false);
      setDeleteMemory1Active(false);
      setDeleteMemory1Count(0);
      if (deleteMemory1Timer.current) { clearInterval(deleteMemory1Timer.current); deleteMemory1Timer.current = null; }
    } else {
      setDeleteMemory2Pressing(false);
      setDeleteMemory2Active(false);
      setDeleteMemory2Count(0);
      if (deleteMemory2Timer.current) { clearInterval(deleteMemory2Timer.current); deleteMemory2Timer.current = null; }
    }
  };

  // Handle green start button press and hold logic
  const handleStartButtonPress = (buttonType: 'all' | 'branch1' | 'branch2') => {
    if (buttonType === 'all') {
      if (startAllTimer.current) clearInterval(startAllTimer.current);
      setStartAllPressing(true);
      setStartAllActive(true);
    } else if (buttonType === 'branch1') {
      if (startBranch1Timer.current) clearInterval(startBranch1Timer.current);
      setStartBranch1Pressing(true);
      setStartBranch1Active(true);
    } else if (buttonType === 'branch2') {
      if (startBranch2Timer.current) clearInterval(startBranch2Timer.current);
      setStartBranch2Pressing(true);
      setStartBranch2Active(true);
    }
  };

  const handleStartButtonRelease = (buttonType: 'all' | 'branch1' | 'branch2') => {
    if (buttonType === 'all') {
      setStartAllPressing(false);
      // Start flashing animation
      setStartAllFlashing(true);
      let flashCount = 0;
      startAllTimer.current = setInterval(() => {
        flashCount++;
        setStartAllActive(prev => !prev);
        if (flashCount >= 6) { // 3 complete flashes (on/off = 2 counts per flash)
          if (startAllTimer.current) {
            clearInterval(startAllTimer.current);
            startAllTimer.current = null;
          }
          setStartAllActive(false);
          setStartAllFlashing(false);
        }
      }, 250); // 0.25s for each flash state = 0.5s per complete flash
    } else if (buttonType === 'branch1') {
      setStartBranch1Pressing(false);
      // Start flashing animation
      setStartBranch1Flashing(true);
      let flashCount = 0;
      startBranch1Timer.current = setInterval(() => {
        flashCount++;
        setStartBranch1Active(prev => !prev);
        if (flashCount >= 6) { // 3 complete flashes
          if (startBranch1Timer.current) {
            clearInterval(startBranch1Timer.current);
            startBranch1Timer.current = null;
          }
          setStartBranch1Active(false);
          setStartBranch1Flashing(false);
        }
      }, 250);
    } else if (buttonType === 'branch2') {
      setStartBranch2Pressing(false);
      // Start flashing animation
      setStartBranch2Flashing(true);
      let flashCount = 0;
      startBranch2Timer.current = setInterval(() => {
        flashCount++;
        setStartBranch2Active(prev => !prev);
        if (flashCount >= 6) { // 3 complete flashes
          if (startBranch2Timer.current) {
            clearInterval(startBranch2Timer.current);
            startBranch2Timer.current = null;
          }
          setStartBranch2Active(false);
          setStartBranch2Flashing(false);
        }
      }, 250);
    }
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (deleteMemory1Timer.current) clearInterval(deleteMemory1Timer.current);
      if (deleteMemory2Timer.current) clearInterval(deleteMemory2Timer.current);
      if (startAllTimer.current) clearInterval(startAllTimer.current);
      if (startBranch1Timer.current) clearInterval(startBranch1Timer.current);
      if (startBranch2Timer.current) clearInterval(startBranch2Timer.current);
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
                      position: 'relative',
                      width: 68,
                      height: 68,
                      margin: "0 auto 8px auto",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    {/* Ant Design Spinner */}
                    {startAllPressing && (
                      <Spin
                        spinning={true}
                        indicator={<LoadingOutlined style={{ color: 'limegreen', fontSize: 74 }} spin />}
                        style={{
                          position: 'absolute',
                          top: -3,
                          left: -46,
                          width: 160,
                          height: 160,
                          zIndex: 1
                        }}
                        size="large"
                      />
                    )}
                    
                    {/* Button */}
                    <div
                      style={{
                        position: 'relative',
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
                        zIndex: 2,
                        touchAction: 'none'
                      }}
                      onPointerDown={(e) => {
                        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                        handleStartButtonPress('all');
                      }}
                      onPointerUp={() => handleStartButtonRelease('all')}
                      onPointerCancel={() => handleStartButtonRelease('all')}
                    >
                      <PoweroffOutlined
                        style={{
                          fontSize: 26,
                          color: startAllActive ? "#fff" : "#999"
                        }}
                      />
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card className="bg-green-100" styles={{ body: { padding: 16, textAlign: 'center', minHeight: 140, position: 'relative' } }} variant="borderless">
                  <div className="mb-2 font-semibold">{t('robot_control_start_branch1')}</div>
                  <div
                    style={{
                      position: 'relative',
                      width: 68,
                      height: 68,
                      margin: "0 auto 8px auto",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    {/* Ant Design Spinner */}
                    {startBranch1Pressing && (
                      <Spin
                        spinning={true}
                        indicator={<LoadingOutlined style={{ color: 'limegreen', fontSize: 74 }} spin />}
                        style={{
                          position: 'absolute',
                          top: -3,
                          left: -46,
                          width: 160,
                          height: 160,
                          zIndex: 1
                        }}
                        size="large"
                      />
                    )}
                    
                    {/* Button */}
                    <div
                      style={{
                        position: 'relative',
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
                        zIndex: 2,
                        touchAction: 'none'
                      }}
                      onPointerDown={(e) => {
                        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                        handleStartButtonPress('branch1');
                      }}
                      onPointerUp={() => handleStartButtonRelease('branch1')}
                      onPointerCancel={() => handleStartButtonRelease('branch1')}
                    >
                      <PoweroffOutlined
                        style={{
                          fontSize: 26,
                          color: startBranch1Active ? "#fff" : "#999"
                        }}
                      />
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card className="bg-green-100" styles={{ body: { padding: 16, textAlign: 'center', minHeight: 140, position: 'relative' } }} variant="borderless">
                  <div className="mb-2 font-semibold">{t('robot_control_start_branch2')}</div>
                  <div
                    style={{
                      position: 'relative',
                      width: 68,
                      height: 68,
                      margin: "0 auto 8px auto",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    {/* Ant Design Spinner */}
                    {startBranch2Pressing && (
                      <Spin
                        spinning={true}
                        indicator={<LoadingOutlined style={{ color: 'limegreen', fontSize: 74 }} spin />}
                        style={{
                          position: 'absolute',
                          top: -3,
                          left: -46,
                          width: 160,
                          height: 160,
                          zIndex: 1
                        }}
                        size="large"
                      />
                    )}
                    
                    {/* Button */}
                    <div
                      style={{
                        position: 'relative',
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
                        zIndex: 2,
                        touchAction: 'none'
                      }}
                      onPointerDown={(e) => {
                        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                        handleStartButtonPress('branch2');
                      }}
                      onPointerUp={() => handleStartButtonRelease('branch2')}
                      onPointerCancel={() => handleStartButtonRelease('branch2')}
                    >
                      <PoweroffOutlined
                        style={{
                          fontSize: 26,
                          color: startBranch2Active ? "#fff" : "#999"
                        }}
                      />
                    </div>
                  </div>
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
                      margin: "0 auto 8px auto",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    {/* Ant Design Spinner */}
                    {deleteMemory1Pressing && (
                      <Spin
                        spinning={true}
                        indicator={<LoadingOutlined style={{ color: '#ff4d4f', fontSize: 74 }} spin />}
                        style={{
                          position: 'absolute',
                          top: -3,
                          left: -46,
                          width: 160,
                          height: 160,
                          zIndex: 1
                        }}
                        size="large"
                      />
                    )}
                    
                    {/* Button */}
                    <div
                      style={{
                        position: 'relative',
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
                        zIndex: 2,
                        touchAction: 'none',    
                      }}
                      onPointerDown={(e) => {
                        // capture để vẫn nhận pointerup khi kéo ra ngoài
                        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                        handleRedButtonPress(1);
                      }}
                      onPointerUp={() => handleRedButtonRelease(1)}
                      onPointerCancel={() => handleRedButtonRelease(1)}
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
                      margin: "0 auto",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    {/* Ant Design Spinner */}
                    {deleteMemory2Pressing && (
                      <Spin
                        spinning={true}
                        indicator={<LoadingOutlined style={{ color: '#ff4d4f', fontSize: 74 }} spin />}
                        style={{
                          position: 'absolute',
                          top: -3,
                          left: -46,
                          width: 160,
                          height: 160,
                          zIndex: 1
                        }}
                        size="large"
                      />
                    )}
                    
                    {/* Button */}
                    <div
                      style={{
                        position: 'relative',
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
                        zIndex: 2,
                        touchAction: 'none',    
                      }}
                      onPointerDown={(e) => {
                        // capture để vẫn nhận pointerup khi kéo ra ngoài
                        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                        handleRedButtonPress(2);
                      }}
                      onPointerUp={() => handleRedButtonRelease(2)}
                      onPointerCancel={() => handleRedButtonRelease(2)}
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