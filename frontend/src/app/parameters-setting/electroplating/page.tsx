"use client";

import React, { useEffect, useState } from "react";
import { fetchProducts, fetchProductById } from "@/services/productService";
import { fetchProductSetting, updateProductSetting, fetchProductSettingChanges } from "@/services/settingService";
import { Input, Card, Typography, Spin, Row, Col, message, Radio, Image, Descriptions, Form, Button } from "antd";
import { useLanguage } from '@/components/layout/DashboardLayout';

const { Title } = Typography;
const { Search } = Input;

const ElectroplatingSettingsPage: React.FC = () => {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [productSetting, setProductSetting] = useState<any>(null);
  const [productHistory, setProductHistory] = useState<any[]>([]);
  const [infoLoading, setInfoLoading] = useState(false);
  const [runMode, setRunMode] = useState<'rack' | 'barrel'>('rack');
  const [form] = Form.useForm();

  useEffect(() => {
    if (productSetting) {
      form.setFieldsValue({
        rack_jigCarrier: productSetting?.rackPlating?.jigCarrier,
        rack_pcsJig: productSetting?.rackPlating?.pcsJig,
        rack_timer: productSetting?.rackPlating?.timer,
        ...Object.fromEntries(productSetting?.rackPlating?.tankAndGroups?.flatMap((tank: any, idx: number) => [
          [`rack_tank_${idx}_currentJig`, tank.currentJig],
          [`rack_tank_${idx}_currentTotal`, tank.currentTotal],
          [`rack_tank_${idx}_T1`, tank.T1],
          [`rack_tank_${idx}_T2`, tank.T2],
        ]) || []),
        barrel_kgBarrel: productSetting?.barrelPlating?.kgBarrel,
        barrel_timer: productSetting?.barrelPlating?.timer,
        ...Object.fromEntries(productSetting?.barrelPlating?.tankAndGroups?.flatMap((tank: any, idx: number) => [
          [`barrel_tank_${idx}_currentTotal`, tank.currentTotal],
          [`barrel_tank_${idx}_T1`, tank.T1],
          [`barrel_tank_${idx}_T2`, tank.T2],
        ]) || []),
      });
    } else {
      form.resetFields();
    }
  }, [productSetting, form]);

  // New search handler
  const handleSearch = async (value: string) => {
    setSearch(value);
    if (!value || value.length < 2) {
      setSelectedProduct(null);
      setProductSetting(null);
      setProductHistory([]);
      return;
    }
    setLoading(true);
    setInfoLoading(true);
    try {
      // Try to find product by code or name
      const res = await fetchProducts(1, 1, value);
      if (!res.data || res.data.length === 0) {
        message.error(t('product_not_found'));
        setSelectedProduct(null);
        setProductSetting(null);
        setProductHistory([]);
        setLoading(false);
        setInfoLoading(false);
        return;
      }
      const product = res.data[0];
      const [prodRes, settingRes, historyRes] = await Promise.all([
        fetchProductById(product._id),
        fetchProductSetting(product._id, 1),
        fetchProductSettingChanges(product._id),
      ]);
      setSelectedProduct(prodRes.data);
      setProductSetting(settingRes.data);
      setProductHistory(historyRes.data);
      if (settingRes.data?.mode) {
        setRunMode(settingRes.data.mode);
      }
    } catch (err) {
      message.error(t('failed_to_load_product_info'));
      setSelectedProduct(null);
      setProductSetting(null);
      setProductHistory([]);
    } finally {
      setLoading(false);
      setInfoLoading(false);
    }
  };

  const handleFormFinish = async (values: any) => {
    if (!selectedProduct || !productSetting) return;
    try {
      // Build rackPlating.tankAndGroups
      const rackTankAndGroups = (productSetting.rackPlating?.tankAndGroups || []).map((tank: any, idx: number) => ({
        model: tank.model,
        modelId: tank.modelId,
        modelKey: tank.modelKey,
        modelName: tank.modelName,
        currentJig: values[`rack_tank_${idx}_currentJig`] || 0,
        currentTotal: values[`rack_tank_${idx}_currentTotal`] || 0,
        T1: values[`rack_tank_${idx}_T1`] || 0,
        T2: values[`rack_tank_${idx}_T2`] || 0,
      }));
      // Build barrelPlating.tankAndGroups
      const barrelTankAndGroups = (productSetting.barrelPlating?.tankAndGroups || []).map((tank: any, idx: number) => ({
        model: tank.model,
        modelId: tank.modelId,
        modelKey: tank.modelKey,
        modelName: tank.modelName,
        currentTotal: values[`barrel_tank_${idx}_currentTotal`] || 0,
        T1: values[`barrel_tank_${idx}_T1`] || 0,
        T2: values[`barrel_tank_${idx}_T2`] || 0,
      }));
      const payload = {
        settings: {
          line: 1,
          mode: runMode, // Include the current runMode in the payload
          rackPlating: {
            jigCarrier: values.rack_jigCarrier || 0,
            pcsJig: values.rack_pcsJig || 0,
            timer: values.rack_timer || 0,
            tankAndGroups: rackTankAndGroups,
          },
          barrelPlating: {
            kgBarrel: values.barrel_kgBarrel || 0,
            timer: values.barrel_timer || 0,
            tankAndGroups: barrelTankAndGroups,
          },
        },
      };
      const res = await updateProductSetting(selectedProduct._id, payload);
      if (res.success) {
        message.success(t('apply_successfully'));
        handleSearch(search);
      } else {
        message.error(res.message || t('error_occurred_when_applying'));
      }
    } catch (err) {
      message.error(t('error_occurred_when_applying'));
    }
  };

  const getTankColor = (idx: number) => {
    // Example: 0: green, 1: yellow, 2: gray, 3: red
    const colors = [
      'bg-green-100',
      'bg-yellow-100',
      'bg-gray-100',
      'bg-red-100',
    ];
    return colors[idx % colors.length];
  };

  // Helper to update currentTotal when currentJig or jigCarrier changes
  const handleRackFieldChange = (changedValues: any, allValues: any) => {
    // Find all tank indices
    if (!productSetting?.rackPlating?.tankAndGroups) return;
    const jigCarrier = allValues.rack_jigCarrier;
    productSetting.rackPlating.tankAndGroups.forEach((tank: any, idx: number) => {
      const currentJig = allValues[`rack_tank_${idx}_currentJig`];
      const currentTotal = currentJig * jigCarrier;
      // Set the value in the form (but keep disabled)
      form.setFieldsValue({ [`rack_tank_${idx}_currentTotal`]: currentTotal });
    });
  };

  return (
    <div className="pt-0">
      <Title level={3} className="mb-6">{t('electroplating_setting_title')}</Title>
      <Search
        placeholder={t('search_product_placeholder')}
        onSearch={handleSearch}
        onChange={e => setSearch(e.target.value)}
        value={search}
        allowClear
        loading={loading}
        style={{ width: 350, marginBottom: "24px" }}
      />
      
      {infoLoading ? (
        <div className="flex justify-center items-center h-60">
          <Spin size="large" />
        </div>
      ) : selectedProduct ? (
        <>
          <Row gutter={[32, 32]} className="mb-8">
            {/* Chi tiết sản phẩm */}
            <Col xs={24} md={8}>
              <div className="bg-white rounded-xl border p-6 h-full">
                <div className="text-xl font-bold mb-4">{t('product_details')}</div>
                <div className="flex flex-row gap-6 items-start">
                  {selectedProduct.imageUrl && (
                    <Image src={selectedProduct.imageUrl} width={180} height={180} alt={selectedProduct.name} style={{ objectFit: 'contain', borderRadius: 8 }} />
                  )}
                  <div className="flex flex-col gap-1 flex-1">
                    <div>
                      <div className="text-sm mb-1">{t('product_code')}</div>
                      <Input value={selectedProduct.code} disabled className="font-bold" />
                    </div>
                    <div>
                      <div className="text-sm mb-1">{t('product_name')}</div>
                      <Input value={selectedProduct.name} disabled />
                    </div>
                    <div>
                      <div className="text-sm mb-1">{t('product_size')}</div>
                      <Input value={selectedProduct.sizeDm2} disabled />
                    </div>
                  </div>
                </div>
              </div>
            </Col>
            {/* Thông tin cập nhật */}
            <Col xs={24} md={8}>
              <div className="bg-white rounded-xl border p-6 h-full">
                <div className="text-xl font-bold mb-4">{t('update_info')}</div>
                <div className="flex flex-col gap-1">
                  <div>
                    <div className="text-sm mb-1">{t('line')}</div>
                    <Input value="1" disabled />
                  </div>
                  <div>
                    <div className="text-sm mb-1">{t('user_performed')}</div>
                    <Input value={productHistory[0]?.user?.name || ''} disabled  />
                  </div>
                  <div>
                    <div className="text-sm mb-1">{t('date_performed')}</div>
                    <Input value={productHistory[0] ? new Date(productHistory[0].createdAt).toLocaleDateString('vi-VN') : ''} disabled />
                  </div>
                </div>
              </div>
            </Col>
            {/* Chế độ chạy */}
            <Col xs={24} md={8}>
              <div className="bg-white rounded-xl border p-6 h-full flex flex-col items-center">
                <div className="text-xl font-bold mb-4">{t('run_mode')}</div>
                <Radio.Group
                  value={runMode}
                  onChange={e => setRunMode(e.target.value)}
                  className="flex flex-col gap-1 w-full"
                >
                  <Radio.Button value="rack" className={`w-full h-14 flex items-center font-bold justify-start px-6 border-2 ${runMode === 'rack' ? 'bg-[#181B39] text-white border-[#181B39]' : 'bg-white text-black border-gray-300'}`}> 
                    {runMode === 'rack' && <span className="mr-2 text-green-500 text-xl">✔</span>} {t('run_suspended')}
                  </Radio.Button>
                  <Radio.Button value="barrel" className={`w-full h-14 flex items-center font-bold justify-start px-6 border-2 ${runMode === 'barrel' ? 'bg-[#181B39] text-white border-[#181B39]' : 'bg-white text-black border-gray-300'}`}> 
                    {runMode === 'barrel' && <span className="mr-2 text-green-500 text-xl">✔</span>} {t('run_rotating')}
                  </Radio.Button>
                </Radio.Group>
              </div>
            </Col>
          </Row>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFormFinish}
            onValuesChange={runMode === 'rack' ? handleRackFieldChange : undefined}
          >
            <div
              className={runMode === 'rack' ? '' : 'hidden'}
              style={runMode === 'rack' ? {} : { display: 'none' }}
            >
              <div className="bg-white rounded-xl border p-4 mb-4">
                <div className="flex flex-row justify-between items-center mb-4">
                  <span className="text-xl font-bold">{t('load_parameters')}</span>
                  <div className="flex flex-row gap-2">
                    <div className="flex flex-col items-center">
                      <span className="font-bold mb-1">{t('number_of_jigs_per_carrier')}</span>
                      <Form.Item name="rack_jigCarrier" className="mb-0">
                        <Input type="number" min={0} className="w-24 h-10 text-center" />
                      </Form.Item>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="font-bold mb-1">{t('number_of_pcs_per_jig')}</span>
                      <Form.Item name="rack_pcsJig" className="mb-0">
                        <Input type="number" min={0} className="w-24 h-10 text-center" />
                      </Form.Item>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {productSetting?.rackPlating?.tankAndGroups?.map((tank: any, idx: number) => (
                    <div key={idx} className={`rounded-xl p-4 ${getTankColor(idx)}`}>
                      <div className="font-bold text-l mb-4 text-center">{tank.modelName}</div>
                      <div className="flex flex-row gap-1 mb-4 items-center justify-center">
                        <div className="flex flex-col items-center flex-1">
                          <span className="font-bold">{t('current_current_per_jig')}</span>
                          <Form.Item name={`rack_tank_${idx}_currentJig`} className="mb-0">
                            <Input type="number" min={0} className="w-28 h-10 text-center" />
                          </Form.Item>
                        </div>
                        <div className="flex flex-col items-center flex-1">
                          <span className="font-bold">{t('total_current')}</span>
                          <Form.Item name={`rack_tank_${idx}_currentTotal`} className="mb-0">
                            <Input type="number" min={0} className="w-28 h-10 text-center bg-gray-200" disabled />
                          </Form.Item>
                        </div>
                      </div>
                      <div className="flex flex-row gap-1 items-center justify-center">
                        <div className="flex flex-col items-center flex-1">
                          <span className="font-bold">{t('t1')}</span>
                          <Form.Item name={`rack_tank_${idx}_T1`} className="mb-0">
                            <Input type="number" min={0} className="w-28 h-10 text-center" />
                          </Form.Item>
                        </div>
                        <div className="flex flex-col items-center flex-1">
                          <span className="font-bold">{t('t2')}</span>
                          <Form.Item name={`rack_tank_${idx}_T2`} className="mb-0">
                            <Input type="number" min={0} className="w-28 h-10 text-center" />
                          </Form.Item>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-row items-center gap-8 bg-white rounded-xl border p-6 mb-6">
                <span className="text-xl font-bold">{t('load_timer')}</span>
                <span className="ml-8 font-semibold">{t('nickel_plating_timer')}</span>
                <Form.Item name="rack_timer" className="mb-0 ml-2">
                  <Input type="number" min={600} max={3600} className="w-32 h-10 text-center" />
                </Form.Item>
                <div className="flex-1 flex justify-end">
                  <Button type="primary" htmlType="submit" className="h-10 w-48 bg-black text-white border-black">{t('apply')}</Button>
                </div>
              </div>
            </div>
            <div
              className={runMode === 'barrel' ? '' : 'hidden'}
              style={runMode === 'barrel' ? {} : { display: 'none' }}
            >
              <div className="bg-white rounded-xl border p-4 mb-4">
                <div className="flex flex-row justify-between items-center mb-4">
                  <span className="text-xl font-bold">{t('load_parameters')}</span>
                  <div className="flex flex-col items-center">
                    <span className="font-bold mb-1">{t('kg_per_barrel')}</span>
                    <Form.Item name="barrel_kgBarrel" className="mb-0">
                      <Input type="number" min={0} className="w-24 h-10 text-center" />
                    </Form.Item>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {productSetting?.barrelPlating?.tankAndGroups?.map((tank: any, idx: number) => (
                    <div key={idx} className={`rounded-xl p-4 ${getTankColor(idx)}`}> 
                      <div className="font-bold  mb-4 text-center">{tank.modelName}</div>
                      <div className="flex flex-row mb-4 items-center">
                        <div className="flex flex-col items-center flex-1">
                          <span className="font-bold">{t('total_current')}</span>
                          <Form.Item name={`barrel_tank_${idx}_currentTotal`} className="mb-0">
                            <Input type="number" min={0} className="w-28 h-10 text-center" />
                          </Form.Item>
                        </div>
                        
                        <div className="flex-1"></div>
                      </div>
                      <div className="flex flex-row gap-4 items-center">
                        <div className="flex flex-col items-center flex-1">
                          <span className="font-bold">{t('t1')}</span>
                          <Form.Item name={`barrel_tank_${idx}_T1`} className="mb-0">
                            <Input type="number" min={0} className="w-28 h-10 text-center" />
                          </Form.Item>
                        </div>
                        <div className="flex flex-col items-center flex-1">
                          <span className="font-bold">{t('t2')}</span>
                          <Form.Item name={`barrel_tank_${idx}_T2`} className="mb-0">
                            <Input type="number" min={0} className="w-28 h-10 text-center" />
                          </Form.Item>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-row items-center gap-8 bg-white rounded-xl border p-6 mb-6">
                <span className="text-xl font-bold">{t('load_timer')}</span>
                <span className="ml-8 font-semibold">{t('nickel_plating_timer')}</span>
                <Form.Item name="barrel_timer" className="mb-0 ml-2">
                  <Input type="number" min={0} className="w-32 h-10 text-center" />
                </Form.Item>
                <div className="flex-1 flex justify-end">
                  <Button type="primary" htmlType="submit" className="h-10 w-48 bg-black text-white border-black">{t('apply')}</Button>
                </div>
              </div>
            </div>
          </Form>
        </>
      ) : null}

    </div>
  );
};

export default ElectroplatingSettingsPage; 