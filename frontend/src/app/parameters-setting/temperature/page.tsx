"use client";

import React, { useEffect, useState } from 'react';
import { fetchTemperatureSettings, updateTemperatureSettings, TempSetting, FetchTempSettingsResponse } from '@/services/settingService';
import { Form, InputNumber, Button, Typography, Row, Col, message, Spin, Card } from 'antd';
import { useLanguage } from '@/components/layout/DashboardLayout';

const { Title } = Typography;

const TemperatureSettingsPage: React.FC = () => {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<TempSetting[]>([]);
  const [temperatures, setTemperatures] = useState<{ [_id: string]: number | null }>({});
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response: FetchTempSettingsResponse = await fetchTemperatureSettings();
      setSettings(response.data);
      // Initialize temperatures state
      const initialTemps: { [id: string]: number | null } = {};
      response.data.forEach((setting: TempSetting) => {
        initialTemps[setting._id] = setting.temp ?? null;
      });
      setTemperatures(initialTemps);
      form.setFieldsValue(initialTemps);
    } catch (err) {
      message.error(t('cannot_load_temperature_data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFinish = async (values: { [_id: string]: number | null }) => {
    const list = settings.map((setting) => ({
      _id: setting._id,
      name: setting.name,
      temp: values[setting._id] ?? null,
      plcVariableName: setting.plcVariableName ?? null
    }));
    try {
      const response = await updateTemperatureSettings({ list });
      if (response.success) {
        message.success(t('apply_success'));
        fetchSettings();
      } else {
        message.error(response.message || t('apply_error'));
      }
    } catch (err) {
      message.error(t('apply_error'));
    }
  };

  if (loading) return <div className="flex justify-center items-center h-96"><Spin size="large" /></div>;

  return (
    <div className="pt-0">
      <Title level={3} className="mb-6">{t('temperature_setting_title')}</Title>
      <Card className="bg-white p-8 rounded-lg shadow-md">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={temperatures}
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
              {t('apply')}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default TemperatureSettingsPage; 