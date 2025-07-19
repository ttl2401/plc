"use client";

import React, { useEffect, useState } from "react";
import { Table, Typography, message, Button, DatePicker, Select } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { getLiquidWarning, downloadLiquidWarning, LiquidWarning, FetchLiquidWarningResponse } from "@/services/historyService";
import { getTanks, Tank } from "@/services/resourceService";
import { ExportOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useLanguage } from "@/components/layout/DashboardLayout";

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const WARNING_LEVELS: Record<string, string> = {
  low: 'Thấp',
  high: 'Cao',
};

const formatTime = (val: string | null) => val ? dayjs(val).format('HH:mm:ss') : '';

const LiquidWarningHistoryPage: React.FC = () => {
  const [data, setData] = useState<LiquidWarning[]>([]);
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
  const [tankOptions, setTankOptions] = useState<Tank[]>([]);
  const [selectedTank, setSelectedTank] = useState('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    getTanks().then(res => setTankOptions(res.data || []));
  }, []);

  const loadData = async (page = 1, limit = 10, tank = selectedTank, range = dateRange) => {
    setLoading(true);
    try {
      const from = range && range[0] ? range[0].format('YYYY-MM-DD') : '';
      const to = range && range[1] ? range[1].format('YYYY-MM-DD') : '';
      const res: FetchLiquidWarningResponse = await getLiquidWarning({ page, limit, tank, from, to });
      if (res.success) {
        setData(res.data);
        setPagination({
          ...res.pagination,
          page: res.pagination.page ?? 1,
          prevPage: res.pagination.prevPage === null ? null : null,
          nextPage: res.pagination.nextPage === null ? null : null,
        });
      } else {
        message.error(res.message || t('cannot_load_data'));
        setData([]);
      }
    } catch (err) {
      message.error(t('cannot_load_data'));
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(pagination.page, pagination.limit, selectedTank, dateRange);
    // eslint-disable-next-line
  }, [pagination.page, pagination.limit, selectedTank, dateRange]);

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setPagination(prev => ({
      ...prev,
      page: pagination.current || 1,
      limit: pagination.pageSize || 10,
    }));
  };

  const handleTankChange = (value: string) => {
    setSelectedTank(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleDateChange = (dates: any) => {
    setDateRange(dates);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleExportExcel = async () => {
    const from = dateRange && dateRange[0] ? dateRange[0].format('YYYY-MM-DD') : '';
    const to = dateRange && dateRange[1] ? dateRange[1].format('YYYY-MM-DD') : '';
    await downloadLiquidWarning({ tank: selectedTank, from, to });
  };

  const columns: ColumnsType<LiquidWarning> = [
    {
      title: t('table_index') || '#',
      dataIndex: 'index',
      key: 'index',
      width: 50,
      className: 'text-center',
      render: (_: any, __: any, idx: number) => (pagination.page - 1) * pagination.limit + idx + 1,
    },
    {
      title: t('date') || 'Ngày thực hiện',
      dataIndex: 'date',
      key: 'date',
      className: 'text-center',
      onHeaderCell: () => ({
        style: { textAlign: 'center' }
      }),
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: t('water_tank') || 'Hồ',
      dataIndex: 'tank',
      key: 'tank',
      render: (tank: string) => {
        const found = tankOptions.find(t => t.key === tank);
        return found ? found.name : tank;
      },
    },
    {
      title: t('warning_at') || 'Thời gian',
      dataIndex: 'warningAt',
      key: 'warningAt',
      className: 'text-center',
      onHeaderCell: () => ({
        style: { textAlign: 'center' }
      }),
      render: (warningAt: string) => formatTime(warningAt),
    },
    {
      title: t('warning_level') || 'Mực chất lỏng',
      dataIndex: 'warningLevel',
      key: 'warningLevel',
      render: (level: string) => t(`warning_level_${level}`) || WARNING_LEVELS[level] || level,
    },
  ];

  return (
    <div className="p-6">
      <Title level={2}>{t('liquid_warning_history') || 'CẢNH BÁO MỰC CHẤT LỎNG'}</Title>
      <div className="flex flex-wrap gap-4 items-center mb-4">
        <Select
          value={selectedTank}
          onChange={handleTankChange}
          style={{ minWidth: 200 }}
          placeholder={t('select_tank_group') || 'Chọn hồ'}
        >
          <Option value="">{t('select_tank_group') || 'Chọn hồ'}</Option>
          {tankOptions.map(tank => (
            <Option key={tank.key} value={tank.key}>{tank.name}</Option>
          ))}
        </Select>
        <RangePicker
          value={dateRange as any}
          onChange={handleDateChange}
          format="DD/MM/YYYY"
          style={{ minWidth: 220 }}
        />
        <Button
          icon={<ExportOutlined />}
          onClick={handleExportExcel}
          type="primary"
          className="ml-auto"
        >
          {t('export_excel') || 'Xuất Excel'}
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="_id"
        loading={loading}
        pagination={{
          current: pagination.page,
          pageSize: pagination.limit,
          total: pagination.totalDocs,
          showSizeChanger: true,
          pageSizeOptions: [10, 20, 50],
        }}
        onChange={handleTableChange}
      />
    </div>
  );
};

export default LiquidWarningHistoryPage; 