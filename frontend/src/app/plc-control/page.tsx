"use client";

import { useEffect, useRef, useState } from "react";
import { Card, Checkbox, Button, Row, Col, Typography, Spin } from "antd";
import { PoweroffOutlined, LoadingOutlined } from "@ant-design/icons"; // Ant Design icon
import { useLanguage } from '@/components/layout/DashboardLayout';
import { fetchPLCVariablesChecklist, PLCVariable, updatePLCVariableChecklist } from '@/services/plcVariableService';

const { Title } = Typography;

const Index = () => {
  const { t, lang } = useLanguage();
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
  const [checklistVariables, setChecklistVariables] = useState<PLCVariable[]>([]);
  const [updating, setUpdating] = useState<Record<string, boolean>>({});
  const pressTimerRef = useRef<Record<string, any>>({});

  const getDisplayName = (name: string) => {
    const key = `plc_checklist_label.${name}`;
    const translated = t(key);
    return translated === key ? name : translated;
  };

  useEffect(() => {
    let isMounted = true;
    fetchPLCVariablesChecklist()
      .then((res) => {
        if (isMounted && res.success) {
          setChecklistVariables(res.data);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleVariable = async (variable: PLCVariable) => {
    if (updating[variable._id]) return;
    setUpdating(prev => ({ ...prev, [variable._id]: true }));
    const newValue = !Boolean(variable.value);
    try {
      await updatePLCVariableChecklist({ variables: [{ name: variable.name, value: newValue }] });
      setChecklistVariables(prev => prev.map(v => v._id === variable._id ? { ...v, value: newValue } : v));
    } catch (e) {
      // silent fail; could add notification later
    } finally {
      setUpdating(prev => ({ ...prev, [variable._id]: false }));
    }
  };

  const onPressStart = (id: string, variable: PLCVariable) => {
    // start a long-press timer (600ms)
    pressTimerRef.current[id] = setTimeout(() => {
      toggleVariable(variable);
      pressTimerRef.current[id] = null;
    }, 600);
  };

  const onPressEnd = (id: string, variable: PLCVariable) => {
    const timer = pressTimerRef.current[id];
    if (timer) {
      clearTimeout(timer);
      pressTimerRef.current[id] = null;
      // treat as normal click if released before long-press threshold
      toggleVariable(variable);
    }
  };

  const handleCheckboxChange = (id: number, checked: boolean) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: checked
    }));
  };

  // Note: Controls are display-only for now; status is taken from API values

  const resetChecklist = () => {
    setCheckedItems({});
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f6fa", padding: 24 }}>
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ marginBottom: 0 }}>{t('plc_checklist_title')}</Title>
      </div>
      <Row gutter={32}>
        {/* Checklist hidden as requested. Keeping code commented for future use. */}
        {/**
        <Col xs={24} md={8}>
          <Card
            title={<div style={{ textAlign: "center", fontWeight: 600 }}>{t('plc_checklist_card_title')}</div>}
            variant="outlined"
          >
            ... checklist UI ...
          </Card>
        </Col>
        */}
        {/* Control Switches - Full width */}
        <Col xs={24}>
          <Card
            title={
              <div style={{ textAlign: "center", fontWeight: 600 }}>{t('plc_control_switch_title')}</div>
            }
            variant="outlined"
          >
            <Row gutter={[16, 16]}>
              {checklistVariables.map(item => {
                const isOn = Boolean(item.value);
                const displayName = getDisplayName(item.name);
                const color = isOn ? "black" : "red";
                return (
                <Col xs={24} sm={12} lg={8} key={item._id}>
                  <Card
                    hoverable
                    className={isOn ? 'bg-green-100' : ''}
                    style={{
                      borderColor: isOn ? "limegreen" : "#f0f0f0",
                      cursor: 'default',
                      transition: "all 0.3s"
                    }}
                    styles={{ body: { padding: 20, textAlign: "center" } }}
                  >
                    <div style={{ fontWeight: 500, color: color === "red" ? "#ff4d4f" : "#222", marginBottom: 12 }}>
                      {displayName}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{ position: 'relative', width: 68, height: 68, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {updating[item._id] && (
                          <Spin
                            spinning
                            indicator={<LoadingOutlined style={{ color: isOn ? '#ffffff' : 'limegreen', fontSize: 74 }} spin />}
                            style={{ position: 'absolute', top: -3, left: -46, width: 160, height: 160, zIndex: 1 }}
                            size="large"
                          />
                        )}
                        <div
                        onMouseDown={(e) => { e.stopPropagation(); onPressStart(item._id, item); }}
                        onMouseUp={(e) => { e.stopPropagation(); onPressEnd(item._id, item); }}
                        onMouseLeave={() => {
                          const tmr = pressTimerRef.current[item._id];
                          if (tmr) { clearTimeout(tmr); pressTimerRef.current[item._id] = null; }
                        }}
                        onTouchStart={(e) => { e.stopPropagation(); onPressStart(item._id, item); }}
                        onTouchEnd={(e) => { e.stopPropagation(); onPressEnd(item._id, item); }}
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: "50%",
                          border: `4px solid ${isOn ? "limegreen" : "#d9d9d9"}`,
                          background: isOn ? "limegreen" : "#f5f6fa",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.3s",
                          cursor: updating[item._id] ? 'not-allowed' : 'pointer',
                          position: 'relative',
                          zIndex: 2,
                        }}
                      >
                        <PoweroffOutlined
                          style={{
                            fontSize: 26,
                            color: isOn ? "#fff" : "#aaa"
                          }}
                        />
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: isOn ? "limegreen" : "#bbb"
                        }}
                      >
                        {isOn ? t('plc_on') : t('plc_off')}
                      </span>
                    </div>
                  </Card>
                </Col>
              );})}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Index;
