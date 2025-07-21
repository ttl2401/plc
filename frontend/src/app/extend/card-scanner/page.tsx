"use client";

import { useState } from "react";
import { Button, Card, Input, Avatar, Row, Col, Space } from "antd";
import { UserOutlined, SearchOutlined, QrcodeOutlined } from "@ant-design/icons";
import Sidebar from '@/components/extend-information/Sidebar';

// Sidebar lines are handled by Sidebar component

const Index = () => {
  const [selectedLine, setSelectedLine] = useState('01');

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
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        const video = document.createElement('video');
        video.srcObject = stream;
        video.play();
        setTimeout(() => {
          stream.getTracks().forEach(track => track.stop());
        }, 5000);
      } else {
        alert('Camera access is not supported on this device/browser');
      }
    } catch (error) {
      alert('Unable to access camera. Please check permissions.');
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
      bordered
      style={{
        marginBottom: 24,
        borderRadius: 16,
        boxShadow: "0 2px 12px #00000008",
        padding: 0
      }}
      bodyStyle={{ padding: 24 }}
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
        bodyStyle={{ padding: 0 }}
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
        bodyStyle={{ padding: 0 }}
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
      bordered={false}
      className={colors[index % colors.length]}
      style={{
        marginBottom: 20,
        borderRadius: 16,
        boxShadow: "0 2px 12px #00000008"
      }}
      bodyStyle={{ padding: 24 }}
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
