"use client";

import React, { useState, useRef } from "react";
import dynamic from 'next/dynamic';
import { Button, Card, Input, Avatar, Row, Col, Space } from "antd";
import { UserOutlined, SearchOutlined, QrcodeOutlined } from "@ant-design/icons";
import Sidebar from '@/components/extend-information/Sidebar';
import { fetchProducts } from '@/services/productService';
import { fetchProductSetting } from '@/services/settingService';

// Sidebar lines are handled by Sidebar component

// Dynamically import QRScanner to avoid SSR issues
const QRScanner = dynamic(() => import('@yudiel/react-qr-scanner').then(mod => mod.Scanner), { ssr: false });

const Index = () => {
  const [selectedLine, setSelectedLine] = useState('01');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [runMode, setRunMode] = useState<string | null>(null);
  const [rackPlating, setRackPlating] = useState<any>(null);
  const [barrelPlating, setBarrelPlating] = useState<any>(null);

  const processData = [
    {
      title: "Hồ Electro degreasing 1",
      currentPerJig: 5,
      totalCurrent: 60,
      t1: 5,
      t2: 5,
      backgroundColor: "#d9f7be"
    },
    {
      title: "Hồ Electro degreasing 2",
      currentPerJig: 5,
      totalCurrent: 60,
      t1: 5,
      t2: 5,
      backgroundColor: "#fffbe6"
    },
    {
      title: "Hồ Pre-Nickel Plating",
      currentPerJig: 5,
      totalCurrent: 60,
      t1: 5,
      t2: 5,
      backgroundColor: "#f5f5f5"
    },
    {
      title: "Hồ Nickel Plating",
      currentPerJig: 5,
      totalCurrent: 60,
      t1: 5,
      t2: 5,
      backgroundColor: "#ffe1e6"
    }
  ];

  // Add color array for tank blocks
  const tankColors = [
    '#d9f7be', // green
    '#fffbe6', // yellow
    '#f5f5f5', // gray
    '#ffe1e6', // red
  ];

  const handleSearch = async (value: string) => {
    setSearch(value);
    setRunMode(null);
    setRackPlating(null);
    setBarrelPlating(null);
    if (!value || value.length < 2) {
      setProduct(null);
      return;
    }
    setLoading(true);
    try {
      const res = await fetchProducts(1, 1, value);
      if (!res.data || res.data.length === 0) {
        setProduct(null);
        setLoading(false);
        return;
      }
      setProduct(res.data[0]);
      setRunMode(null);
      // fetchProductSetting
      const settingRes = await fetchProductSetting(res.data[0]._id, 1);
      if (settingRes.data && settingRes.data.mode) {
        setRunMode(settingRes.data.mode);
        if (settingRes.data.mode === 'rack') {
          setRackPlating(settingRes.data.rackPlating);
          setBarrelPlating(null);
        } else if (settingRes.data.mode === 'barrel') {
          setBarrelPlating(settingRes.data.barrelPlating);
          setRackPlating(null);
        } else {
          setRackPlating(null);
          setBarrelPlating(null);
        }
      }
    } catch (err) {
      setProduct(null);
      setRunMode(null);
      setRackPlating(null);
      setBarrelPlating(null);
    } finally {
      setLoading(false);
    }
  };

  const handleScanClick = async () => {
    setScannerOpen(true);
  };

  const handleCloseScanner = () => {
    setScannerOpen(false);
  };

  const handleScan = async (result: any) => {
    if (result && result[0] && result[0].rawValue) {
      setScannerOpen(false);
      await handleSearch(result[0].rawValue);
    }
  };

  // Use Tailwind class names for tank block backgrounds
  const colors = [
    'bg-green-100',
    'bg-yellow-100',
    'bg-gray-100',
    'bg-red-100',
  ];

  const ProcessCard = ({
    title,
    currentPerJig,
    totalCurrent,
    t1,
    t2,
    index
  }: typeof processData[0] & { index: number }) => (
    <Card
      variant="borderless"
      className={colors[index % colors.length]}
      style={{
        marginBottom: 20,
        borderRadius: 16,
        boxShadow: "0 2px 12px #00000008"
      }}
      styles={{
        body: { padding: 24 }
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 16 }}>{title}</div>
      <div style={{ display: "flex", gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 4 }}>Dòng điện /Jig</div>
          <div style={{
            fontWeight: 700,
            fontSize: 20,
            background: "#fff",
            borderRadius: 8,
            padding: "8px 0",
            textAlign: "center"
          }}>{currentPerJig}</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 4 }}>Dòng điện tổng</div>
          <div style={{
            fontWeight: 700,
            fontSize: 20,
            background: "#fff",
            borderRadius: 8,
            padding: "8px 0",
            textAlign: "center",
            color: "#ff2d2d"
          }}>{totalCurrent}</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 4 }}>T1</div>
          <div style={{
            fontWeight: 700,
            fontSize: 20,
            background: "#fff",
            borderRadius: 8,
            padding: "8px 0",
            textAlign: "center"
          }}>{t1}</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 4 }}>T2</div>
          <div style={{
            fontWeight: 700,
            fontSize: 20,
            background: "#fff",
            borderRadius: 8,
            padding: "8px 0",
            textAlign: "center"
          }}>{t2}</div>
        </div>
      </div>
    </Card>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f5f5" }}>
      {/* Camera Scanner Popup */}
      {scannerOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.6)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            position: 'relative',
            background: '#fff',
            borderRadius: 16,
            padding: 24,
            boxShadow: '0 4px 24px #00000022',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minWidth: 320,
            minHeight: 320,
          }}>
            <button
              onClick={handleCloseScanner}
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                background: '#ff2d2d',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: 36,
                height: 36,
                fontSize: 20,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
              }}
              aria-label="Đóng camera"
            >
              ×
            </button>
            <div style={{ width: 320, height: 240, borderRadius: 8, background: '#000', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <QRScanner
                onScan={handleScan}
                onError={(error) => console.error("Error:", error)}
                constraints={{ facingMode: 'environment' }}
                formats={[
                  'qr_code',
                  'code_128', 'ean_13', 'ean_8', 'upc_a', 'upc_e',
                  'code_39', 'itf',
                  'pdf417', 'data_matrix'
                ]}
                styles={{
                  container: { width: 320, height: 240 },
                  video: { width: 320, height: 240, objectFit: 'cover', borderRadius: 8 },
                }}
              />
            </div>
            <div style={{ marginTop: 16, fontWeight: 500 }}>Đưa thẻ vào vùng quét</div>
          </div>
        </div>
      )}
      <Sidebar selectedLine={selectedLine} onLineSelect={setSelectedLine} />

      <div style={{ flex: 1, padding: "32px 40px 0 40px" }}>
        {/* Header */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 32 }}>
          <Col>
            <div style={{ fontSize: 28, fontWeight: "bold", color: "#181f3a" }}>LINE {selectedLine}</div>
          </Col>
          <Col>
            <Space size="large">
              <Input.Search
                placeholder="Nhập mã hoặc quét thẻ"
                size="large"
                style={{
                  width: 400,
                  background: "#f5f5f5",
                  borderRadius: 12,
                  fontSize: 18,
                  height: 48
                }}
                value={search}
                onChange={e => setSearch(e.target.value)}
                onSearch={handleSearch}
                loading={loading}
                enterButton={<Button icon={<SearchOutlined />} />}
                suffix={
                  <QrcodeOutlined 
                    style={{ fontSize: 22, color: '#6b7280', cursor: 'pointer' }} 
                    onClick={handleScanClick}
                  />
                }
              />
              <Avatar size={38} icon={<UserOutlined />} style={{ marginBottom: 4, background: "#181f3a" }} />
            </Space>
          </Col>
        </Row>
        {product && (
          <div className="product-detail">
            <Row gutter={32}>
              {/* Left Column - Product Info */}
              <Col span={7}>
                <Card
                  variant="outlined"
                  style={{
                    marginBottom: 24,
                    borderRadius: 16,
                    boxShadow: "0 2px 12px #00000008",
                    padding: 0
                  }}
                  styles={{
                    body: { padding: 24 }
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 16 }}>Chi tiết sản phẩm</div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                    <img
                      alt={product.name}
                      src={product.imageUrl}
                      style={{ width: 80, height: 80, objectFit: "contain", marginBottom: 8, borderRadius: 8, background: "#f5f5f5" }}
                    />
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 4 }}>Mã sản phẩm</div>
                      <div style={{ fontWeight: 700, fontSize: 18, background: "#f5f5f5", padding: "4px 16px", borderRadius: 8 }}>{product.code}</div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 4 }}>Tên sản phẩm</div>
                      <div style={{ fontWeight: 700, fontSize: 18, background: "#f5f5f5", padding: "4px 16px", borderRadius: 8 }}>{product.name}</div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 4 }}>Kích thước (dm2)</div>
                      <div style={{ fontWeight: 700, fontSize: 18, background: "#f5f5f5", padding: "4px 16px", borderRadius: 8 }}>{product.sizeDm2}</div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 4 }}>Chế độ chạy</div>
                      <div style={{ fontWeight: 700, fontSize: 18, background: "#f5f5f5", padding: "4px 16px", borderRadius: 8 }}>{runMode === 'rack' ? 'Chạy treo' : runMode === 'barrel' ? 'Chạy quay' : ''}</div>
                    </div>
                  </div>
                </Card>
                <Space direction="vertical" style={{ width: "100%" }} size={16}>
                  <Button
                    type="primary"
                    size="large"
                    style={{
                      width: "100%",
                      height: 56,
                      fontSize: 20,
                      fontWeight: 700,
                      background: "#181f3a",
                      borderRadius: 12,
                      border: "none"
                    }}
                  >
                    ĐỒNG Ý
                  </Button>
                  <Button
                    size="large"
                    style={{
                      width: "100%",
                      height: 56,
                      fontSize: 20,
                      fontWeight: 700,
                      borderRadius: 12,
                      border: "2px solid #181f3a",
                      background: "#fff",
                      color: "#181f3a"
                    }}
                  >
                    Hủy Bỏ
                  </Button>
                </Space>
              </Col>

              {/* Right Column - Process Info (dynamic for rack mode) */}
              <Col span={17}>
                <div style={{ fontWeight: 700, fontSize: 24, marginBottom: 8 }}>Thông số xi mạ</div>
                {runMode === 'rack' && rackPlating && (
                  <>
                    <div style={{ display: "flex", gap: 24, marginBottom: 24 }}>
                      <Card
                        style={{
                          flex: 1,
                          borderRadius: 12,
                          textAlign: "center",
                          padding: 0,
                          boxShadow: "0 2px 12px #00000008"
                        }}
                        styles={{ body: { padding: 0 } }}
                      >
                        <div style={{ fontWeight: 500, fontSize: 18, padding: "12px 0" }}>Số Jig/Carrier</div>
                        <div style={{ fontWeight: 700, fontSize: 24, color: "#ff2d2d", paddingBottom: 12 }}>{rackPlating.jigCarrier ?? '-'}</div>
                      </Card>
                      <Card
                        style={{
                          flex: 1,
                          borderRadius: 12,
                          textAlign: "center",
                          padding: 0,
                          boxShadow: "0 2px 12px #00000008"
                        }}
                        styles={{ body: { padding: 0 } }}
                      >
                        <div style={{ fontWeight: 500, fontSize: 18, padding: "12px 0" }}>Số Pcs/Jig</div>
                        <div style={{ fontWeight: 700, fontSize: 24, color: "#ff2d2d", paddingBottom: 12 }}>{rackPlating.pcsJig ?? '-'}</div>
                      </Card>
                    </div>
                    <Space direction="vertical" style={{ width: "100%" }} size={0}>
                      {(rackPlating.tankAndGroups || []).map((tank: any, idx: number) => (
                        <Card
                          key={idx}
                          variant="borderless"
                          className={colors[idx % colors.length]}
                          style={{
                            marginBottom: 20,
                            borderRadius: 16,
                            boxShadow: "0 2px 12px #00000008"
                          }}
                          styles={{ body: { padding: 24 } }}
                        >
                          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 16 }}>{tank.modelName || `Bể ${idx + 1}`}</div>
                          <div style={{ display: "flex", gap: 16 }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 4 }}>Dòng điện /Jig</div>
                              <div style={{
                                fontWeight: 700,
                                fontSize: 20,
                                background: "#fff",
                                borderRadius: 8,
                                padding: "8px 0",
                                textAlign: "center"
                              }}>{tank.currentJig ?? '-'}</div>
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 4 }}>Dòng điện tổng</div>
                              <div style={{
                                fontWeight: 700,
                                fontSize: 20,
                                background: "#fff",
                                borderRadius: 8,
                                padding: "8px 0",
                                textAlign: "center",
                                color: "#ff2d2d"
                              }}>{tank.currentTotal ?? '-'}</div>
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 4 }}>T1</div>
                              <div style={{
                                fontWeight: 700,
                                fontSize: 20,
                                background: "#fff",
                                borderRadius: 8,
                                padding: "8px 0",
                                textAlign: "center"
                              }}>{tank.T1 ?? '-'}</div>
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 4 }}>T2</div>
                              <div style={{
                                fontWeight: 700,
                                fontSize: 20,
                                background: "#fff",
                                borderRadius: 8,
                                padding: "8px 0",
                                textAlign: "center"
                              }}>{tank.T2 ?? '-'}</div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </Space>
                  </>
                )}
                {runMode === 'barrel' && barrelPlating && (
                  <>
                    <div style={{ display: "flex", gap: 24, marginBottom: 24 }}>
                      <Card
                        style={{
                          flex: 1,
                          borderRadius: 12,
                          textAlign: "center",
                          padding: 0,
                          boxShadow: "0 2px 12px #00000008"
                        }}
                        styles={{ body: { padding: 0 } }}
                      >
                        <div style={{ fontWeight: 500, fontSize: 18, padding: "12px 0" }}>Số kg/Barrel</div>
                        <div style={{ fontWeight: 700, fontSize: 24, color: "#ff2d2d", paddingBottom: 12 }}>{barrelPlating.kgBarrel ?? '-'}</div>
                      </Card>
                    </div>
                    <Space direction="vertical" style={{ width: "100%" }} size={0}>
                      {(barrelPlating.tankAndGroups || []).map((tank: any, idx: number) => (
                        <Card
                          key={idx}
                          variant="borderless"
                          className={colors[idx % colors.length]}
                          style={{
                            marginBottom: 20,
                            borderRadius: 16,
                            boxShadow: "0 2px 12px #00000008"
                          }}
                          styles={{ body: { padding: 24 } }}
                        >
                          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 16 }}>{tank.modelName || `Bể ${idx + 1}`}</div>
                          <div style={{ display: "flex", gap: 16 }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 4 }}>Dòng điện tổng</div>
                              <div style={{
                                fontWeight: 700,
                                fontSize: 20,
                                background: "#fff",
                                borderRadius: 8,
                                padding: "8px 0",
                                textAlign: "center",
                                color: "#ff2d2d"
                              }}>{tank.currentTotal ?? '-'}</div>
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 4 }}>T1</div>
                              <div style={{
                                fontWeight: 700,
                                fontSize: 20,
                                background: "#fff",
                                borderRadius: 8,
                                padding: "8px 0",
                                textAlign: "center"
                              }}>{tank.T1 ?? '-'}</div>
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 4 }}>T2</div>
                              <div style={{
                                fontWeight: 700,
                                fontSize: 20,
                                background: "#fff",
                                borderRadius: 8,
                                padding: "8px 0",
                                textAlign: "center"
                              }}>{tank.T2 ?? '-'}</div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </Space>
                  </>
                )}
              </Col>
            </Row>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
