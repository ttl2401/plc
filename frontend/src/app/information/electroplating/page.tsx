"use client";

import React, { useEffect, useState } from 'react';
import { Table, Typography, message, Input, Button, Space, Image, Select } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { fetchInformationPlating } from '@/services/informationService';
import { ExportOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Search } = Input;

const modeOptions = [
  { label: 'Chọn chế độ chạy', value: '' },
  { label: 'Treo', value: 'rack' },
  { label: 'Quay', value: 'barrel' },
];

const InformationElectroplatingPage: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    totalDocs: 0,
    limit: 10,
    totalPages: 0,
    page: 1,
    pagingCounter: 0,
    hasPrevPage: false,
    hasNextPage: false,
    prevPage: null,
    nextPage: null,
  });
  const [searchText, setSearchText] = useState('');
  const [mode, setMode] = useState('');

  const loadData = async (page = 1, limit = 10, search = '', mode = '') => {
    setLoading(true);
    try {
      const res = await fetchInformationPlating({ page, limit, search, mode });
      if (res.success) {
        setData(res.data);
        setPagination({
          ...res.pagination,
          page: res.pagination.page ?? 1,
          prevPage: res.pagination.prevPage === null ? null : null,
          nextPage: res.pagination.nextPage === null ? null : null,
        });
      } else {
        message.error(res.message || 'Không thể tải dữ liệu');
        setData([]);
      }
    } catch (err) {
      message.error('Không thể tải dữ liệu');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(pagination.page, pagination.limit, searchText, mode);
    // eslint-disable-next-line
  }, [pagination.page, pagination.limit, mode]);

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setPagination(prev => ({
      ...prev,
      page: pagination.current || 1,
      limit: pagination.pageSize || 10,
    }));
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    setPagination(prev => ({ ...prev, page: 1 }));
    loadData(1, pagination.limit, value, mode);
  };

  const handleModeChange = (value: string) => {
    setMode(value);
    setPagination(prev => ({ ...prev, page: 1 }));
    loadData(1, pagination.limit, searchText, value);
  };

  // Helper to render plating columns
  const renderPlatingCell = (tank: any, field: string, isRack: boolean) => {
    if (!tank) return <span>N/A</span>;
    if (isRack && (field === 'currentJig' || field === 'currentTotal')) {
      return tank[field] !== undefined ? <span>{tank[field]}</span> : <span>N/A</span>;
    }
    if (!isRack && field === 'currentTotal') {
      return tank[field] !== undefined ? <span>{tank[field]}</span> : <span>N/A</span>;
    }
    if (field === 'T1' || field === 'T2') {
      return tank[field] !== undefined ? <span>{tank[field]}</span> : <span>N/A</span>;
    }
    return <span>N/A</span>;
  };

  // Build dynamic columns for tanks
  const tankNames = [
    'Hồ Electron Degreasing 1',
    'Hồ Electron Degreasing 2',
    'Hồ Pre-Nickel Plating',
    'Hồ Nickel Plating',
  ];

  const columns: ColumnsType<any> = [
    {
      title: '#',
      dataIndex: 'index',
      key: 'index',
      width: 50,
      render: (_: any, __: any, idx: number) => (pagination.page - 1) * pagination.limit + idx + 1,
    },
    {
      title: 'Sản Phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Image src={record.imageUrl} alt={record.name} width={50} height={50} style={{ objectFit: 'cover', borderRadius: 8 }} />
          <Space direction="vertical" size={0}>
            <span className="font-bold">{record.name}</span>
            <span style={{ color: '#52c41a' }}>ID: {record.code}</span>
          </Space>
        </Space>
      ),
    },
    {
      title: 'Số dm²',
      dataIndex: 'sizeDm2',
      key: 'sizeDm2',
    },
    {
      title: 'Chế độ chạy',
      dataIndex: 'mode',
      key: 'mode',
      width: "5%",
      render: (_:any, record: any) => record.settings[0].mode === 'rack' ? 'Treo' : record.settings[0].mode === 'barrel' ? 'Quay' : '',
    },
    {
      title: 'Jig/Carrier (Kg/Barrel)',
      dataIndex: 'jigCarrier',
      key: 'jigCarrier',
      width: '4%',
      render: (_: any, record: any) => record.settings[0].mode === 'rack' ? record.settings[0].rackPlating?.jigCarrier : record.settings[0].barrelPlating?.kgBarrel,
    },
    {
      title: 'Pcs/Jig',
      dataIndex: 'pcsJig',
      key: 'pcsJig',
      render: (_: any, record: any) => record.settings[0].mode === 'rack' ? record.settings[0].rackPlating?.pcsJig : 'N/A',
    },
    // Dynamic tank columns
    ...tankNames.map((tankName, tankIdx) => ({
      title: (
        <div className={
          tankIdx === 0 ? 'bg-green-100' :
          tankIdx === 1 ? 'bg-yellow-100' :
          tankIdx === 2 ? 'bg-gray-100' :
          'bg-red-100'
        } style={{ padding: 4, borderRadius: 4 }}>
          {tankName} <br /> (J/Jig)
        </div>
      ),
      children: [
        {
          title: 'Dòng điện',
          dataIndex: `currentJig_${tankIdx}`,
          key: `currentJig_${tankIdx}`,
          render: (_: any, record: any) => {
            const isRack = record.settings[0].mode === 'rack';
            const tank = isRack ? record.settings[0].rackPlating?.tankAndGroups?.[tankIdx] : record.settings[0].barrelPlating?.tankAndGroups?.[tankIdx];
            return isRack ? renderPlatingCell(tank, 'currentJig', true) : <span>N/A</span>;
          },
        },
        {
          title: 'Dòng tổng',
          dataIndex: `currentTotal_${tankIdx}`,
          key: `currentTotal_${tankIdx}`,
          render: (_: any, record: any) => {
            const isRack = record.settings[0].mode === 'rack';
            const tank = isRack ? record.settings[0].rackPlating?.tankAndGroups?.[tankIdx] : record.settings[0].barrelPlating?.tankAndGroups?.[tankIdx];
            return renderPlatingCell(tank, 'currentTotal', isRack);
          },
        },
        {
          title: 'T1',
          dataIndex: `T1_${tankIdx}`,
          key: `T1_${tankIdx}`,
          render: (_: any, record: any) => {
            const isRack = record.settings[0].mode === 'rack';
            const tank = isRack ? record.settings[0].rackPlating?.tankAndGroups?.[tankIdx] : record.settings[0].barrelPlating?.tankAndGroups?.[tankIdx];
            return renderPlatingCell(tank, 'T1', isRack);
          },
        },
        {
          title: 'T2',
          dataIndex: `T2_${tankIdx}`,
          key: `T2_${tankIdx}`,
          render: (_: any, record: any) => {
            const isRack = record.settings[0].mode === 'rack';
            const tank = isRack ? record.settings[0].rackPlating?.tankAndGroups?.[tankIdx] : record.settings[0].barrelPlating?.tankAndGroups?.[tankIdx];
            return renderPlatingCell(tank, 'T2', isRack);
          },
        },
      ],
    })),
  ];

  return (
    <div className="pt-0">
      <Title level={3} className="mb-6">THÔNG TIN XI MẠ</Title>
      <div className="flex flex-row justify-between items-center mb-4">
        <Search
          placeholder="Nhập mã sản phẩm hoặc tên sản phẩm để tìm kiếm"
          onSearch={handleSearch}
          allowClear
          style={{ width: 350 }}
        />
        <div className="flex flex-row gap-3">
          <Select
            options={modeOptions}
            value={mode}
            onChange={handleModeChange}
            style={{ width: 180 }}
          />
          <Button icon={<ExportOutlined />} type="default">Xuất Excel</Button>
        </div>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey={(record) => record._id || record.id}
        pagination={{
          current: pagination.page,
          pageSize: pagination.limit,
          total: pagination.totalDocs,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
          showTotal: (total) => `Show result: ${total}`,
        }}
        onChange={handleTableChange}
        bordered
        scroll={{ x: 'max-content' }}
      />
      <style jsx global>{`
        table th {
          
          padding: 8px 8px!important;
        }
      `}
      </style>
    </div>
  );
};

export default InformationElectroplatingPage; 