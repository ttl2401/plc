"use client"

import React, { useEffect, useState } from 'react';
import { fetchTimerSettings, updateTimerSettings, TimerSetting, FetchTimerSettingsResponse } from '@/services/settingService';
import { Form, InputNumber, Button, Typography, Row, Col, message, Spin, Card } from 'antd';

const { Title } = Typography;

const TimerSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<TimerSetting[]>([]);
  const [timers, setTimers] = useState<{ [_id: string]: number | null }>({});
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response: FetchTimerSettingsResponse = await fetchTimerSettings();
      setSettings(response.data);
      // Initialize timers state
      const initialTimers: { [_id: string]: number | null } = {};
      response.data.forEach((setting: TimerSetting) => {
        initialTimers[setting._id] = setting.timer ?? null;
      });
      setTimers(initialTimers);
      form.setFieldsValue(initialTimers);
    } catch (err) {
      message.error('Không thể tải dữ liệu timer');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFinish = async (values: { [id: string]: number | null }) => {
    // Build the list array for the payload
    const list = settings.map((setting) => ({
      _id: setting._id,
      name: setting.name,
      timer: values[setting._id] ?? null,
    }));
    try {
      const response = await updateTimerSettings({ list });
      if (response.success) {
        message.success('Áp dụng thành công!');
        fetchSettings();
      } else {
        message.error(response.message || 'Có lỗi xảy ra khi áp dụng.');
      }
    } catch (err) {
      message.error('Có lỗi xảy ra khi áp dụng.');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-96"><Spin size="large" /></div>;

  return (
    <div className="pt-0">
      <Title level={3} className="mb-6">CÀI ĐẶT THÔNG SỐ TIMER</Title>
      <Card className="bg-white p-8 rounded-lg shadow-md">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={timers}
        >
          <Row gutter={[32, 32]}>
            {settings.map((setting) => (
              <Col key={setting._id} xs={24} sm={12} md={8} lg={6} className="flex flex-col items-center">
                <Form.Item
                  label={<span className="font-semibold text-center">{setting.name}</span>}
                  name={setting._id}
                  className="w-full"
                >
                  <InputNumber
                    min={0}
                    className="w-20 h-10 text-xl font-medium text-center"
                    style={{ width: '80%' }}
                  />
                </Form.Item>
              </Col>
            ))}
          </Row>
          <div className="flex w-full justify-end mt-8">
            <Button
              type="primary"
              htmlType="submit"
              className="px-12 py-3 text-md"
              size="large"
            >
              Áp dụng
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default TimerSettingsPage; 