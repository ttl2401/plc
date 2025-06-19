"use client"

import React, { useEffect, useState } from 'react';
import { fetchTimerSettings, TankGroup, FetchTimerSettingsResponse } from '@/services/settingService';
import { Form, InputNumber, Button, Typography, Row, Col, message, Spin, Card } from 'antd';

const { Title } = Typography;

const TimerSettingsPage: React.FC = () => {
  const [tankGroups, setTankGroups] = useState<TankGroup[]>([]);
  const [timers, setTimers] = useState<{ [id: string]: number | null }>({});
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const response: FetchTimerSettingsResponse = await fetchTimerSettings();
        setTankGroups(response.data);
        // Initialize timers state
        const initialTimers: { [id: string]: number | null } = {};
        response.data.forEach((group: TankGroup) => {
          initialTimers[group._id] = group.settings?.timer ? Number(group.settings.timer) : null;
        });
        setTimers(initialTimers);
        form.setFieldsValue(initialTimers);
      } catch (err) {
        message.error('Không thể tải dữ liệu timer');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFinish = (values: { [id: string]: number | null }) => {
    // TODO: Implement submit logic using updateTimerSettings
    message.success('Áp dụng thành công (demo)');
  };

  if (loading) return <div className="flex justify-center items-center h-96"><Spin size="large" /></div>;

  return (
    <div className="p-8">
      <Title level={2} className="mb-6">CÀI ĐẶT THÔNG SỐ TIMER</Title>
      <Card className="bg-white p-8 rounded-lg shadow-md">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={timers}
        >
          <Row gutter={[32, 32]}>
            {tankGroups.map((group) => (
              <Col key={group._id} xs={24} sm={12} md={8} lg={6} className="flex flex-col items-center">
                <Form.Item
                  label={<span className="font-semibold text-center">{group.name}</span>}
                  name={group._id}
                  className="w-full"
                >
                  <InputNumber
                    min={0}
                    className="w-32 h-12 text-2xl font-medium text-center"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            ))}
          </Row>
          <div className="flex justify-end mt-8">
            <Button
              type="primary"
              htmlType="submit"
              className="px-12 py-3 text-lg font-semibold"
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