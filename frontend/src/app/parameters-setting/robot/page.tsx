"use client";

import React, { useEffect, useState } from 'react';
import { fetchRobotSettings, updateRobotSettings, RobotSetting, FetchRobotSettingsResponse } from '@/services/settingService';
import { Form, InputNumber, Button, Typography, Row, Col, message, Spin, Card } from 'antd';
import { useLanguage } from '@/components/layout/DashboardLayout';

const { Title } = Typography;


const RobotSettingsPage: React.FC = () => {
  const { t } = useLanguage();
  const [robots, setRobots] = useState<RobotSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();

  const dwellFields = [
    { key: 'topDwellTime', label: t('robot_top_dwell_time') },
    { key: 'loweringWaitingTime', label: t('robot_lowering_waiting_time') },
    { key: 'bottomDwellTime', label: t('robot_bottom_dwell_time') },
  ];
  
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response: FetchRobotSettingsResponse = await fetchRobotSettings();
      setRobots(response.data);
      // Set initial values for the form
      const initialValues: any = {};
      response.data.forEach((robot) => {
        dwellFields.forEach((field) => {
          initialValues[`${robot._id}_rack_${field.key}`] = robot.rackSettings[field.key as keyof typeof robot.rackSettings];
          initialValues[`${robot._id}_barrel_${field.key}`] = robot.barrelSettings[field.key as keyof typeof robot.barrelSettings];
        });
      });
      form.setFieldsValue(initialValues);
    } catch (err) {
      message.error(t('cannot_load_robot_data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFinish = async (values: any) => {
    // Build the list for the payload
    const list = robots.map((robot) => ({
      _id: robot._id,
      name: robot.name,
      rackSettings: {
        topDwellTime: values[`${robot._id}_rack_topDwellTime`] ?? 0,
        loweringWaitingTime: values[`${robot._id}_rack_loweringWaitingTime`] ?? 0,
        bottomDwellTime: values[`${robot._id}_rack_bottomDwellTime`] ?? 0,
      },
      barrelSettings: {
        topDwellTime: values[`${robot._id}_barrel_topDwellTime`] ?? 0,
        loweringWaitingTime: values[`${robot._id}_barrel_loweringWaitingTime`] ?? 0,
        bottomDwellTime: values[`${robot._id}_barrel_bottomDwellTime`] ?? 0,
      },
    }));
    try {
      const response = await updateRobotSettings({ list });
      if (response.success) {
        message.success(t('save_success'));
        fetchSettings();
      } else {
        message.error(response.message || t('apply_error'));
      }
    } catch (err) {
      message.error(t('apply_error'));
    }
  };

  const handleReset = () => {
    fetchSettings();
  };

  if (loading) return <div className="flex justify-center items-center h-96"><Spin size="large" /></div>;

  return (
    <div className="pt-0">
      <Title level={3} className="mb-6">{t('robot_setting_title')}</Title>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        className="w-full"
      >
        <Row gutter={[32, 32]}>
          {robots.map((robot, idx) => (
            <Col key={robot._id} xs={24} sm={24} md={8}>
              <Card
                className={`rounded-xl shadow-md h-full flex flex-col items-center ${idx === 0 ? 'border-2 border-gray-800' : 'border border-gray-300'}`}
                bodyStyle={{ width: '100%', padding: 24 }}
              >
                <div className="text-3xl font-bold text-center mb-6">{robot.name}</div>
                {/* Rack Mode */}
                <div className="mb-6 w-full">
                  <div className="text-lg font-semibold text-center mb-4" style={{ color: 'limegreen' }}>{t('robot_rack_mode')}</div>
                  {dwellFields.map((field) => (
                    <div className="flex flex-row items-center gap-2">
                        <span className="font-medium min-w-[140px] pb-5">{field.label}</span>
                        <Form.Item
                          key={`${robot._id}_rack_${field.key}`}
                          name={`${robot._id}_rack_${field.key}`}
                          className="mb-2"
                          style={{ marginBottom: 12 }}
                          colon={false}
                          label={null}
                        >
                          <InputNumber
                            min={0}
                            className="w-40 h-10 text-xl font-medium text-center"
                            addonAfter={<span className="text-base">s</span>}
                          />
                        </Form.Item>
                    </div>
                  ))}
                </div>
                {/* Barrel Mode */}
                <div className="w-full">
                  <div className="text-lg font-semibold text-center mb-4" style={{ color: 'limegreen' }}>{t('robot_barrel_mode')}</div>
                  {dwellFields.map((field) => (
                    <div className="flex flex-row items-center gap-2">
                        <span className="font-medium min-w-[140px] pb-5">{field.label}</span>
                        <Form.Item
                          key={`${robot._id}_barrel_${field.key}`}
                          name={`${robot._id}_barrel_${field.key}`}
                          className="mb-2"
                          style={{ marginBottom: 12 }}
                          colon={false}
                          label={null}
                        >
                          <InputNumber
                            min={0}
                            className="w-40 h-10 text-xl font-medium text-center"
                            addonAfter={<span className="text-base">s</span>}
                          />
                        </Form.Item>
                    </div>
                  ))}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
        <div className="flex flex-row gap-4 justify-center mt-6">
          <Button onClick={handleReset} className="h-12 w-40 text-lg border-black">{t('reset')}</Button>
          <Button type="primary" htmlType="submit" className="h-12 w-60 text-lg font-semibold">{t('save_changes')}</Button>
        </div>
      </Form>
    </div>
  );
};

export default RobotSettingsPage; 