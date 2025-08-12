"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button, Card, Row, Col, Typography, Spin, message } from 'antd';
import { PoweroffOutlined, LoadingOutlined } from '@ant-design/icons';
import { useLanguage } from '@/components/layout/DashboardLayout';
import GaugeButton from "@/components/GaugeButton";
import SlidePopup from './SlidePopup';
import { fetchPLCVariables, updatePLCVariable, PLCVariable } from '@/services/robotControlService';

const { Title } = Typography;

const RobotControlPage = () => {
  const { t } = useLanguage();

  // --- Popup xác nhận E-Stop ---
  const [showPopup, setShowPopup] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<number>(1);

  // --- UI state cho nút momentary (xanh/đỏ) ---
  const [startAllActive, setStartAllActive] = useState(false);
  const [startBranch1Active, setStartBranch1Active] = useState(false);
  const [startBranch2Active, setStartBranch2Active] = useState(false);
  const [startAllPressing, setStartAllPressing] = useState(false);
  const [startBranch1Pressing, setStartBranch1Pressing] = useState(false);
  const [startBranch2Pressing, setStartBranch2Pressing] = useState(false);

  const [deleteMemory1Active, setDeleteMemory1Active] = useState(false);
  const [deleteMemory2Active, setDeleteMemory2Active] = useState(false);
  const [deleteMemory1Pressing, setDeleteMemory1Pressing] = useState(false);
  const [deleteMemory2Pressing, setDeleteMemory2Pressing] = useState(false);
  const [deleteMemory1Count, setDeleteMemory1Count] = useState(0);
  const [deleteMemory2Count, setDeleteMemory2Count] = useState(0);

  // timers
  const startAllTimer = useRef<NodeJS.Timeout | null>(null);
  const startBranch1Timer = useRef<NodeJS.Timeout | null>(null);
  const startBranch2Timer = useRef<NodeJS.Timeout | null>(null);
  const deleteMemory1Timer = useRef<NodeJS.Timeout | null>(null);
  const deleteMemory2Timer = useRef<NodeJS.Timeout | null>(null);

  // --- Dữ liệu PLC ---
  const [plcVariables, setPlcVariables] = useState<PLCVariable[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false); // dùng cho spinner tổng (không chặn momentary)

  const getPLCVariableValue = (name: string): boolean => {
    const variable = plcVariables.find(v => v.name === name);
    return variable ? Boolean(variable.value) : false;
  };

  // E‑Stop derived từ DB (không state cục bộ)
  const estop1 = getPLCVariableValue('Estop_1');
  const estop2 = getPLCVariableValue('Estop_2');

  // --- API ---
  const loadPLCVariables = async () => {
    try {
      setLoading(true);
      const res = await fetchPLCVariables();
      if (res.success) {
        setPlcVariables(res.data);
      } else {
        message.error('Failed to fetch PLC variables');
      }
    } catch (err) {
      console.error('Error fetching PLC variables:', err);
      message.error('Error fetching PLC variables');
    } finally {
      setLoading(false);
    }
  };

  const updatePLCVariableValue = async (name: string, value: boolean) => {
    try {
      setUpdating(true);
      const res = await updatePLCVariable({ variables: [{ name, value }] });
      if (res.success) {
        setPlcVariables(prev =>
          prev.map(v => (v.name === name ? { ...v, value, updatedAt: new Date().toISOString() } : v))
        );
        return true;
      } else {
        message.error(`Failed to update ${name}`);
        return false;
      }
    } catch (err) {
      console.error(`Error updating ${name}:`, err);
      message.error(`Error updating ${name}`);
      return false;
    } finally {
      setUpdating(false);
    }
  };

  // ------------------------------
  // Helper: Momentary press/release
  // ------------------------------
  function makeMomentaryHandlers(
    varName: string,
    opts: {
      setPressing: (v: boolean) => void;
      setActive: (v: boolean) => void;
      timerRef?: React.MutableRefObject<NodeJS.Timeout | null>;
      onPressSetup?: () => void;      // ví dụ: start counter
      onReleaseCleanup?: () => void;  // ví dụ: clear counter
    }
  ) {
    const busyRef = useRef(false);        // đang gọi API cho varName
    const pendingOffRef = useRef(false);  // đã nhả trong lúc đang gọi true

    const onPress = async () => {
      if (busyRef.current) return;
      pendingOffRef.current = false;

      // clear timer cũ
      if (opts.timerRef?.current) {
        clearInterval(opts.timerRef.current);
        opts.timerRef.current = null;
      }

      // feedback UI ngay
      opts.setPressing(true);
      opts.setActive(true);
      opts.onPressSetup?.();

      try {
        busyRef.current = true;
        const ok = await updatePLCVariableValue(varName, true);
        if (!ok) {
          opts.setPressing(false);
          opts.setActive(false);
          opts.onReleaseCleanup?.();
          return;
        }
      } finally {
        busyRef.current = false;
      }

      // Nếu đã nhả trong lúc đang gọi true
      if (pendingOffRef.current) {
        try {
          busyRef.current = true;
          await updatePLCVariableValue(varName, false);
          opts.setPressing(false);
          opts.setActive(false);
          opts.onReleaseCleanup?.();
        } finally {
          busyRef.current = false;
          pendingOffRef.current = false;
        }
      }
    };

    const onRelease = async () => {
      // dừng timer ngay
      if (opts.timerRef?.current) {
        clearInterval(opts.timerRef.current);
        opts.timerRef.current = null;
      }

      if (busyRef.current) {
        // đang gọi true → ghi nhận cần tắt
        pendingOffRef.current = true;
        return;
      }

      // không bận → tắt ngay
      opts.setPressing(false);
      opts.setActive(false);
      opts.onReleaseCleanup?.();
      await updatePLCVariableValue(varName, false);
    };

    return { onPress, onRelease };
  }

  // Tạo handlers cho nút momentary
  const startAll = makeMomentaryHandlers('Start_Chung', {
    setPressing: setStartAllPressing,
    setActive: setStartAllActive,
    timerRef: startAllTimer,
  });

  const startB1 = makeMomentaryHandlers('Start_Nhanh_1', {
    setPressing: setStartBranch1Pressing,
    setActive: setStartBranch1Active,
    timerRef: startBranch1Timer,
  });

  const startB2 = makeMomentaryHandlers('Start_Nhanh_2', {
    setPressing: setStartBranch2Pressing,
    setActive: setStartBranch2Active,
    timerRef: startBranch2Timer,
  });

  const red1 = makeMomentaryHandlers('Stop_Nhanh_1', {
    setPressing: setDeleteMemory1Pressing,
    setActive: setDeleteMemory1Active,
    timerRef: deleteMemory1Timer,
    onPressSetup: () => {
      setDeleteMemory1Count(1);
      deleteMemory1Timer.current = setInterval(() => setDeleteMemory1Count(c => c + 1), 1000);
    },
    onReleaseCleanup: () => {
      setDeleteMemory1Count(0);
      if (deleteMemory1Timer.current) {
        clearInterval(deleteMemory1Timer.current);
        deleteMemory1Timer.current = null;
      }
    },
  });

  const red2 = makeMomentaryHandlers('Stop_Nhanh_2', {
    setPressing: setDeleteMemory2Pressing,
    setActive: setDeleteMemory2Active,
    timerRef: deleteMemory2Timer,
    onPressSetup: () => {
      setDeleteMemory2Count(1);
      deleteMemory2Timer.current = setInterval(() => setDeleteMemory2Count(c => c + 1), 1000);
    },
    onReleaseCleanup: () => {
      setDeleteMemory2Count(0);
      if (deleteMemory2Timer.current) {
        clearInterval(deleteMemory2Timer.current);
        deleteMemory2Timer.current = null;
      }
    },
  });

  // --- E‑Stop click logic (derive từ DB, không set state tay) ---
  const estopBusyRef = useRef(false);
  const handleEmergencyButtonClick = async (buttonNumber: 1 | 2) => {
    if (estopBusyRef.current) return;
    estopBusyRef.current = true;
    try {
      const varName = buttonNumber === 1 ? 'Estop_1' : 'Estop_2';
      const isActive = getPLCVariableValue(varName);
      if (!isActive) {
        await updatePLCVariableValue(varName, true); // bật ngay
      } else {
        setSelectedBranch(buttonNumber);              // đang active -> cần xác nhận
        setShowPopup(true);
      }
    } finally {
      estopBusyRef.current = false;
    }
  };

  // --- Toggle gauges (không phải momentary) ---
  const handleGaugeButtonToggle = async (variableName: string, currentValue: boolean) => {
    const newValue = !currentValue;
    const ok = await updatePLCVariableValue(variableName, newValue);
    if (!ok) message.error(`Failed to update ${variableName}`);
    return ok;
  };

  // --- lifecycle ---
  useEffect(() => {
    loadPLCVariables();
  }, []);

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
        <Title level={2} style={{ marginBottom: 0 }}>
          {t('robot_control_title')}
          {(loading || updating) && (
            <Spin
              indicator={<LoadingOutlined style={{ fontSize: 24, marginLeft: 16 }} spin />}
              style={{ marginLeft: 16 }}
            />
          )}
        </Title>
      </div>

      <Row gutter={32}>
        {/* Left: momentary & E-Stop */}
        <Col xs={24} md={14}>
          <Card title={<div style={{ fontWeight: 600 }}>{t('robot_control_push_buttons')}</div>} style={{ marginBottom: 24 }} variant="outlined">
            <Row gutter={16} style={{ marginBottom: 16 }}>
              {/* Start all */}
              <Col xs={24} md={8}>
                <Card className="bg-green-100" styles={{ body: { padding: 16, textAlign: 'center', minHeight: 140, position: 'relative' } }} variant="borderless">
                  <div className="mb-2 font-semibold">{t('robot_control_start_all')}</div>
                  <div style={{ position: 'relative', width: 68, height: 68, margin: "0 auto 8px auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {startAllPressing && (
                      <Spin spinning indicator={<LoadingOutlined style={{color: 'limegreen', fontSize: 74 }} spin />} style={{ position: 'absolute', top: -3, left: -46, width: 160, height: 160, zIndex: 1 }} size="large" />
                    )}
                    <div
                      style={{
                        position: 'relative',
                        width: 60, height: 60, borderRadius: "50%",
                        border: (startAllActive || getPLCVariableValue('Start_Chung')) ? "4px solid limegreen" : "4px solid #d9d9d9",
                        background: (startAllActive || getPLCVariableValue('Start_Chung')) ? "limegreen" : "#f5f5f5",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", transition: "all 0.3s", zIndex: 2, touchAction: 'none'
                      }}
                      onPointerDown={(e) => { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); startAll.onPress(); }}
                      onPointerUp={() => startAll.onRelease()}
                      onPointerCancel={() => startAll.onRelease()}
                    >
                      <PoweroffOutlined style={{ fontSize: 26, color: (startAllActive || getPLCVariableValue('Start_Chung')) ? "#fff" : "#999" }} />
                    </div>
                  </div>
                </Card>
              </Col>

              {/* Start nhanh 1 */}
              <Col xs={24} md={8}>
                <Card className="bg-green-100" styles={{ body: { padding: 16, textAlign: 'center', minHeight: 140, position: 'relative' } }} variant="borderless">
                  <div className="mb-2 font-semibold">{t('robot_control_start_branch1')}</div>
                  <div style={{ position: 'relative', width: 68, height: 68, margin: "0 auto 8px auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {startBranch1Pressing && (
                      <Spin spinning indicator={<LoadingOutlined style={{color: 'limegreen', fontSize: 74 }} spin />} style={{ position: 'absolute', top: -3, left: -46, width: 160, height: 160, zIndex: 1 }} size="large" />
                    )}
                    <div
                      style={{
                        position: 'relative',
                        width: 60, height: 60, borderRadius: "50%",
                        border: (startBranch1Active || getPLCVariableValue('Start_Nhanh_1')) ? "4px solid limegreen" : "4px solid #d9d9d9",
                        background: (startBranch1Active || getPLCVariableValue('Start_Nhanh_1')) ? "limegreen" : "#f5f5f5",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", transition: "all 0.3s", zIndex: 2, touchAction: 'none'
                      }}
                      onPointerDown={(e) => { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); startB1.onPress(); }}
                      onPointerUp={() => startB1.onRelease()}
                      onPointerCancel={() => startB1.onRelease()}
                    >
                      <PoweroffOutlined style={{ fontSize: 26, color: (startBranch1Active || getPLCVariableValue('Start_Nhanh_1')) ? "#fff" : "#999" }} />
                    </div>
                  </div>
                </Card>
              </Col>

              {/* Start nhanh 2 */}
              <Col xs={24} md={8}>
                <Card className="bg-green-100" styles={{ body: { padding: 16, textAlign: 'center', minHeight: 140, position: 'relative' } }} variant="borderless">
                  <div className="mb-2 font-semibold">{t('robot_control_start_branch2')}</div>
                  <div style={{ position: 'relative', width: 68, height: 68, margin: "0 auto 8px auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {startBranch2Pressing && (
                      <Spin spinning indicator={<LoadingOutlined style={{color: 'limegreen', fontSize: 74 }} spin />} style={{ position: 'absolute', top: -3, left: -46, width: 160, height: 160, zIndex: 1 }} size="large" />
                    )}
                    <div
                      style={{
                        position: 'relative',
                        width: 60, height: 60, borderRadius: "50%",
                        border: (startBranch2Active || getPLCVariableValue('Start_Nhanh_2')) ? "4px solid limegreen" : "4px solid #d9d9d9",
                        background: (startBranch2Active || getPLCVariableValue('Start_Nhanh_2')) ? "limegreen" : "#f5f5f5",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", transition: "all 0.3s", zIndex: 2, touchAction: 'none'
                      }}
                      onPointerDown={(e) => { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); startB2.onPress(); }}
                      onPointerUp={() => startB2.onRelease()}
                      onPointerCancel={() => startB2.onRelease()}
                    >
                      <PoweroffOutlined style={{ fontSize: 26, color: (startBranch2Active || getPLCVariableValue('Start_Nhanh_2')) ? "#fff" : "#999" }} />
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Red buttons */}
            <Row gutter={16} justify="end">
              <Col xs={12} md={8}>
                <Card className="bg-red-100" styles={{ body: { padding: 16, textAlign: 'center', minHeight: 140, position: 'relative' } }} variant="borderless">
                  <div className="mb-2 font-semibold">{t('robot_control_delete_memory_branch1')}</div>
                  <div style={{ position: 'relative', width: 68, height: 68, margin: "0 auto 8px auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {deleteMemory1Pressing && (
                      <Spin spinning indicator={<LoadingOutlined style={{color: '#ff4d4f', fontSize: 74 }} spin />} style={{ position: 'absolute', top: -3, left: -46, width: 160, height: 160, zIndex: 1 }} size="large" />
                    )}
                    <div
                      style={{
                        position: 'relative',
                        width: 60, height: 60, borderRadius: "50%",
                        border: (deleteMemory1Active || getPLCVariableValue('Stop_Nhanh_1')) ? "4px solid #ff4d4f" : "4px solid #d9d9d9",
                        background: (deleteMemory1Active || getPLCVariableValue('Stop_Nhanh_1')) ? "#ff4d4f" : "#f5f5f5",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", transition: "all 0.3s", zIndex: 2, touchAction: 'none'
                      }}
                      onPointerDown={(e) => { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); red1.onPress(); }}
                      onPointerUp={() => red1.onRelease()}
                      onPointerCancel={() => red1.onRelease()}
                    >
                      <PoweroffOutlined style={{ fontSize: 26, color: (deleteMemory1Active || getPLCVariableValue('Stop_Nhanh_1')) ? "#fff" : "#999" }} />
                    </div>
                  </div>
                  <div style={{ position: 'absolute', bottom: 6, left: 0, right: 0 }} className="text-red-600 font-bold">
                    {deleteMemory1Pressing ? t('robot_control_pressed_seconds').replace('{seconds}', deleteMemory1Count.toString()) : ''}
                  </div>
                </Card>
              </Col>

              <Col xs={12} md={8}>
                <Card className="bg-red-100" styles={{ body: { padding: 16, textAlign: 'center', minHeight: 140, position: 'relative' } }} variant="borderless">
                  <div className="mb-2 font-semibold">{t('robot_control_delete_memory_branch2')}</div>
                  <div style={{ position: 'relative', width: 68, height: 68, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {deleteMemory2Pressing && (
                      <Spin spinning indicator={<LoadingOutlined style={{color: '#ff4d4f', fontSize: 74 }} spin />} style={{ position: 'absolute', top: -3, left: -46, width: 160, height: 160, zIndex: 1 }} size="large" />
                    )}
                    <div
                      style={{
                        position: 'relative',
                        width: 60, height: 60, borderRadius: "50%",
                        border: (deleteMemory2Active || getPLCVariableValue('Stop_Nhanh_2')) ? "4px solid #ff4d4f" : "4px solid #d9d9d9",
                        background: (deleteMemory2Active || getPLCVariableValue('Stop_Nhanh_2')) ? "#ff4d4f" : "#f5f5f5",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", transition: "all 0.3s", zIndex: 2, touchAction: 'none'
                      }}
                      onPointerDown={(e) => { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); red2.onPress(); }}
                      onPointerUp={() => red2.onRelease()}
                      onPointerCancel={() => red2.onRelease()}
                    >
                      <PoweroffOutlined style={{ fontSize: 26, color: (deleteMemory2Active || getPLCVariableValue('Stop_Nhanh_2')) ? "#fff" : "#999" }} />
                    </div>
                  </div>
                  <div style={{ position: 'absolute', bottom: 6, left: 0, right: 0 }} className="text-red-600 font-bold">
                    {deleteMemory2Pressing ? t('robot_control_pressed_seconds').replace('{seconds}', deleteMemory2Count.toString()) : ''}
                  </div>
                </Card>
              </Col>
            </Row>
          </Card>

          {/* Emergency */}
          <Card title={<div style={{ fontWeight: 600 }}>ON/OFF {t('robot_control_emergency')}</div>} variant="outlined">
            <Row gutter={16} justify="end">
              <Col xs={12} md={8}>
                <Card className="bg-red-100" styles={{ body: { padding: 16, textAlign: 'center', minHeight: 140, position: 'relative' } }} variant="borderless">
                  <div className="mb-2 font-semibold">{t('robot_control_emergency_branch1')}</div>
                  <div
                    style={{
                      width: 60, height: 60, borderRadius: "50%",
                      border: "4px solid #ff4d4f",
                      background: estop1 ? "#ff4d4f" : "#f5f5f5",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", transition: "all 0.3s", margin: "0 auto 8px auto"
                    }}
                    onClick={() => handleEmergencyButtonClick(1)}
                  >
                    <PoweroffOutlined style={{ fontSize: 32, color: estop1 ? "#fff" : "#999" }} />
                  </div>
                  <div style={{ position: 'absolute', bottom: 6, left: 0, right: 0 }} className="text-red-600 font-bold">
                    {estop1 ? t('robot_control_stopped') : ''}
                  </div>
                </Card>
              </Col>

              <Col xs={12} md={8}>
                <Card className="bg-red-100" styles={{ body: { padding: 16, textAlign: 'center', minHeight: 140, position: 'relative' } }} variant="borderless">
                  <div className="mb-2 font-semibold">{t('robot_control_emergency_branch2')}</div>
                  <div
                    style={{
                      width: 60, height: 60, borderRadius: "50%",
                      border: "4px solid #ff4d4f",
                      background: estop2 ? "#ff4d4f" : "#f5f5f5",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", transition: "all 0.3s", margin: "0 auto 8px auto"
                    }}
                    onClick={() => handleEmergencyButtonClick(2)}
                  >
                    <PoweroffOutlined style={{ fontSize: 32, color: estop2 ? "#fff" : "#999" }} />
                  </div>
                  <div style={{ position: 'absolute', bottom: 6, left: 0, right: 0 }} className="text-red-600 font-bold">
                    {estop2 ? t('robot_control_stopped') : ''}
                  </div>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Right: Switches */}
        <Col xs={24} md={10}>
          <Card title={<div style={{ fontWeight: 600 }}>{t('robot_control_switch_buttons')}</div>} variant="outlined">
            <Row gutter={16} justify="end">
              <Col xs={24} md={12} style={{ paddingBottom: 16 }}>
                <Card className="bg-gray-50" styles={{ body: { padding: 16, textAlign: 'center' } }} variant="outlined" style={{ border: '2px solid #d9d9d9', borderRadius: '8px' }}>
                  <GaugeButton
                    checked={getPLCVariableValue('Treo_Quay')}
                    label={t('robot_control_suspended_rotate')}
                    value={getPLCVariableValue('Treo_Quay') ? t('robot_control_rotate') : t('robot_control_suspended')}
                    leftLabel={t('robot_control_rotate')}
                    rightLabel={t('robot_control_suspended')}
                    onChange={async (newValue: boolean) => {
                      await handleGaugeButtonToggle('Treo_Quay', !newValue);
                    }}
                  />
                </Card>
              </Col>

              <Col xs={24} md={12} style={{ paddingBottom: 16 }}>
                <Card className="bg-gray-50" styles={{ body: { padding: 16, textAlign: 'center' } }} variant="outlined" style={{ border: '2px solid #d9d9d9', borderRadius: '8px' }}>
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
                <Card className="bg-gray-50" styles={{ body: { padding: 16, textAlign: 'center' } }} variant="outlined" style={{ border: '2px solid #d9d9d9', borderRadius: '8px' }}>
                  <GaugeButton
                    checked={getPLCVariableValue('Washing_No_Washsing')}
                    label={t('robot_control_washing')}
                    value={getPLCVariableValue('Washing_No_Washsing') ? t('robot_control_washing_yes') : t('robot_control_washing_no')}
                    leftLabel={t('robot_control_washing_yes')}
                    rightLabel={t('robot_control_washing_no')}
                    onChange={async (newValue: boolean) => {
                      await handleGaugeButtonToggle('Washing_No_Washsing', !newValue);
                    }}
                  />
                </Card>
              </Col>

              <Col xs={24} md={12} style={{ paddingBottom: 16 }}>
                <Card className="bg-gray-50" styles={{ body: { padding: 16, textAlign: 'center' } }} variant="outlined" style={{ border: '2px solid #d9d9d9', borderRadius: '8px' }}>
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
        onConfirm={async () => {
          const varName = selectedBranch === 1 ? 'Estop_1' : 'Estop_2';
          const ok = await updatePLCVariableValue(varName, false);
          if (ok) {
            setShowPopup(false);
          } else {
            message.error('Tắt khẩn thất bại, vui lòng thử lại');
          }
        }}
        branchNumber={selectedBranch}
      />
    </div>
  );
};

export default RobotControlPage;
