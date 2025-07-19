"use client";

import React, { useEffect, useState } from "react";
import { Table, Typography, message, Button, DatePicker, Select } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { getHistoryOperation, downloadHistoryOperation, HistoryOperation, FetchHistoryOperationResponse } from "@/services/historyService";
import { ExportOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useLanguage } from "@/components/layout/DashboardLayout";

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const ACTIONS = [
  { value: '', label: 'Tất cả hoạt động' },
  { value: 'press_estop_1', label: 'Nhấn Estop 1' },
  { value: 'press_estop_2', label: 'Nhấn Estop 2' },
];

const HistoryOperationPage: React.FC = () => {
  const [data, setData] = useState<HistoryOperation[]>([]);
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
  const [selectedAction, setSelectedAction] = useState('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const { t } = useLanguage();

  const loadData = async (page = 1, limit = 10, action = selectedAction, range = dateRange) => {
    setLoading(true);
    try {
      const from = range && range[0] ? range[0].format('YYYY-MM-DD') : '';
      const to = range && range[1] ? range[1].format('YYYY-MM-DD') : '';
      const res: FetchHistoryOperationResponse = await getHistoryOperation({ page, limit, action, from, to });
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
    loadData(pagination.page, pagination.limit, selectedAction, dateRange);
    // eslint-disable-next-line
  }, [pagination.page, pagination.limit, selectedAction, dateRange]);

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setPagination(prev => ({
      ...prev,
      page: pagination.current || 1,
      limit: pagination.pageSize || 10,
    }));
  };

  const handleActionChange = (value: string) => {
    setSelectedAction(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleDateChange = (dates: any) => {
    setDateRange(dates);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Placeholder for Excel export
  const handleExportExcel = async () => {
    const from = dateRange && dateRange[0] ? dateRange[0].format('YYYY-MM-DD') : '';
    const to = dateRange && dateRange[1] ? dateRange[1].format('YYYY-MM-DD') : '';
    await downloadHistoryOperation({ action: selectedAction, from, to });
  };

  const columns: ColumnsType<HistoryOperation> = [
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
      onHeaderCell: () => ({
        style: { textAlign: 'center' }
      }),
      className: 'text-center',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: t('action') || 'Hành động',
      dataIndex: 'action',
      key: 'action',
      render: (action: string) => {
        const found = ACTIONS.find(a => a.value === action);
        return found ? found.label : action;
      },
    },
    {
      title: t('times') || 'Lần thứ',
      dataIndex: 'countPerDay',
      key: 'countPerDay',
      onHeaderCell: () => ({
        style: { textAlign: 'center' }
      }),
      className: 'text-center',
      render: (_: any, record: any) => record.countPerDay,
    },
    {
      title: t('started_at') || 'Giờ bắt đầu',
      dataIndex: 'startedAt',
      key: 'startedAt',
      onHeaderCell: () => ({
        style: { textAlign: 'center' }
      }),
      className: 'text-center',
      render: (startedAt: string) => startedAt ? dayjs(startedAt).format('HH:mm:ss') : '',
    },
    {
      title: t('ended_at') || 'Giờ kết thúc',
      dataIndex: 'endedAt',
      key: 'endedAt',
      onHeaderCell: () => ({
        style: { textAlign: 'center' }
      }),
      className: 'text-center',
      render: (endedAt: string) => endedAt ? dayjs(endedAt).format('HH:mm:ss') : '',
    },
  ];

  return (
    <div className="p-6">
      <Title level={2}>{t('operation_history') || 'LỊCH SỬ VẬN HÀNH'}</Title>
      <div className="flex flex-wrap gap-4 items-center mb-4">
        <Select
          value={selectedAction}
          onChange={handleActionChange}
          style={{ minWidth: 200 }}
        >
          {ACTIONS.map(action => (
            <Option key={action.value} value={action.value}>{action.label}</Option>
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

export default HistoryOperationPage; 