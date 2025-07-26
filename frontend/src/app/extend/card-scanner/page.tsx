"use client";

import React, { useState, useRef } from "react";
import dynamic from 'next/dynamic';
import { Button, Card, Input, Avatar, Row, Col, Space } from "antd";
import { UserOutlined, SearchOutlined, QrcodeOutlined } from "@ant-design/icons";
import Sidebar from '@/components/extend-information/Sidebar';

// Sidebar lines are handled by Sidebar component

// Dynamically import QRScanner to avoid SSR issues
const QRScanner = dynamic(() => import('@yudiel/react-qr-scanner').then(mod => mod.Scanner), { ssr: false });

const Index = () => {
  const [selectedLine, setSelectedLine] = useState('01');
  const [scannerOpen, setScannerOpen] = useState(false);

  const productData = {
    productImage: "https://xima-api.ztechhub.net/product/2025-07-08/72a8070e-2d45-4aa1-b019-e0cecc0039df.jpg",
    productCode: "DC63-02767AP",
    productName: "Vòi xịt trắng",
    size: 10,
    mode: "Chạy treo"
  };

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

  const handleScanClick = async () => {
    setScannerOpen(true);
  };

  const handleCloseScanner = () => {
    setScannerOpen(false);
  };

  const handleScan = (result: any) => {
    console.log('QR Result:', result)
    if (result && result[0] && result[0].rawValue) {
      alert(`QR Code: ${result[0].rawValue}`);
      console.log('QR Code:', result[0].rawValue);
      setScannerOpen(false);
    }
  };

  // Product Info Panel
  const ProductInfoPanel = ({
    productImage,
    productCode,
    productName,
    size,
    mode
  }: typeof productData) => (
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
          alt={productName}
          src={productImage}
          style={{ width: 80, height: 80, objectFit: "contain", marginBottom: 8, borderRadius: 8, background: "#f5f5f5" }}
        />
        <div>
          <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 4 }}>Mã sản phẩm</div>
          <div style={{ fontWeight: 700, fontSize: 18, background: "#f5f5f5", padding: "4px 16px", borderRadius: 8 }}>{productCode}</div>
        </div>
        <div>
          <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 4 }}>Tên sản phẩm</div>
          <div style={{ fontWeight: 700, fontSize: 18, background: "#f5f5f5", padding: "4px 16px", borderRadius: 8 }}>{productName}</div>
        </div>
        <div>
          <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 4 }}>Kích thước (dm2)</div>
          <div style={{ fontWeight: 700, fontSize: 18, background: "#f5f5f5", padding: "4px 16px", borderRadius: 8 }}>{size}</div>
        </div>
        <div>
          <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 4 }}>Chế độ chạy</div>
          <div style={{ fontWeight: 700, fontSize: 18, background: "#f5f5f5", padding: "4px 16px", borderRadius: 8 }}>{mode}</div>
        </div>
      </div>
    </Card>
  );

  // Status Bar
  const StatusBar = ({ jigCarrier, pcsJig }: { jigCarrier: number, pcsJig: number }) => (
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
        <div style={{ fontWeight: 700, fontSize: 24, color: "#ff2d2d", paddingBottom: 12 }}>{jigCarrier}</div>
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
        <div style={{ fontWeight: 700, fontSize: 24, color: "#ff2d2d", paddingBottom: 12 }}>{pcsJig}</div>
      </Card>
    </div>
  );

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
              <Input
                placeholder="Nhập mã hoặc quét thẻ"
                size="large"
                style={{
                  width: 400,
                  background: "#f5f5f5",
                  borderRadius: 12,
                  fontSize: 18,
                  height: 48
                }}
                suffix={
                  <Space>
                    <Button
                      icon={<QrcodeOutlined />}
                      type="text"
                      style={{
                        background: "#181f3a",
                        color: "#fff",
                        borderRadius: "50%",
                        width: 40,
                        height: 40,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                      onClick={handleScanClick}
                    />
                    <Button
                      icon={<SearchOutlined />}
                      type="text"
                      style={{
                        background: "#fff",
                        color: "#181f3a",
                        borderRadius: "50%",
                        width: 40,
                        height: 40,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid #181f3a"
                      }}
                    />
                  </Space>
                }
              />
              <Avatar size={48} icon={<UserOutlined />} style={{ background: "#181f3a" }} />
            </Space>
          </Col>
        </Row>

        <Row gutter={32}>
          {/* Left Column - Product Info and Action Buttons */}
          <Col span={7}>
            <ProductInfoPanel {...productData} />
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

          {/* Right Column - Process Info */}
          <Col span={17}>
            <div style={{ fontWeight: 700, fontSize: 24, marginBottom: 8 }}>Thông số xi mạ</div>
            <StatusBar jigCarrier={49.6} pcsJig={30} />
            <Space direction="vertical" style={{ width: "100%" }} size={0}>
              {processData.map((process, index) => (
                <ProcessCard key={index} {...process} index={index} />
              ))}
            </Space>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Index;
