"use client";

import React, { useEffect, useState } from "react";
import { Table, Typography, message, Input, Button, Space, DatePicker, Select } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { fetchInformationTimer, InformationTimer, TimerTankInfo, handleExportExcelTimer } from "@/services/informationService";
import { ExportOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { getTankGroup, TankGroup } from "@/services/resourceService";
import moment from "moment";

const { Title } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;

const tankOrder = [
  "washing",
  "boiling_degreasing",
  "electro_degreasing",
  "pre_nickel_plating",
  "nickel_plating",
  "ultrasonic_hot_rinse",
  "hot_rinse",
  "dryer",
];

const tankLabels: Record<string, string> = {
  washing: "Washing",
  boiling_degreasing: "Boiling Degreasing",
  electro_degreasing: "Electro Degreasing",
  pre_nickel_plating: "Pre-Nickel",
  nickel_plating: "Nickel Plating",
  ultrasonic_hot_rinse: "Ultrasonic",
  hot_rinse: "Hot rinse",
  dryer: "Dryer",
};

const colorMap: Record<string, string> = {
  washing: "#F5F7FA",
  boiling_degreasing: "#F5F7FA",
  electro_degreasing: "#D1F2EB",
  pre_nickel_plating: "#FCF3CF",
  nickel_plating: "#D6EAF8",
  ultrasonic_hot_rinse: "#FDEDEC",
  hot_rinse: "#FADBD8",
  dryer: "#E8DAEF",
};

const InformationTimerPage: React.FC = () => {
  const [data, setData] = useState<InformationTimer[]>([]);
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
  const [searchText, setSearchText] = useState("");
  const [tankGroups, setTankGroups] = useState<TankGroup[]>([]);
  const [selectedTank, setSelectedTank] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[moment.Moment | null, moment.Moment | null] | null>(null);

  useEffect(() => {
    getTankGroup().then(res => setTankGroups(res.data)).catch(() => setTankGroups([]));
  }, []);

  const loadData = async (page = 1, limit = 10, search = "", tank = selectedTank, range = dateRange) => {
    setLoading(true);
    try {
      const from = range && range[0] ? range[0].startOf('day').unix().toString() : '';
      const to = range && range[1] ? range[1].endOf('day').unix().toString() : '';
      const res = await fetchInformationTimer({ page, limit, search, tank: tank || '', from, to });
      if (res.success) {
        setData(res.data);
        setPagination({
          ...res.pagination,
          page: res.pagination.page ?? 1,
          prevPage: res.pagination.prevPage === null ? null : null,
          nextPage: res.pagination.nextPage === null ? null : null,
        });
      } else {
        message.error(res.message || "Không thể tải dữ liệu");
        setData([]);
      }
    } catch (err) {
      message.error("Không thể tải dữ liệu");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(pagination.page, pagination.limit, searchText, selectedTank, dateRange);
    // eslint-disable-next-line
  }, [pagination.page, pagination.limit, selectedTank, dateRange]);

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
    loadData(1, pagination.limit, value, selectedTank, dateRange);
  };

  const handleTankChange = (value: string) => {
    setSelectedTank(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleDateChange = (dates: any) => {
    setDateRange(dates);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Helper to download Excel file
  const handleExportExcel = async (search: string) => {
    try {
      const from = dateRange && dateRange[0] ? dateRange[0].startOf('day').unix().toString() : '';
      const to = dateRange && dateRange[1] ? dateRange[1].endOf('day').unix().toString() : '';
      await handleExportExcelTimer({ line: 1, search, tank: selectedTank || '', from, to });
    } catch (error) {
      message.error('Không thể xuất Excel. Vui lòng thử lại!');
    }
  };

  // Build columns dynamically for tanks
  const columns: ColumnsType<InformationTimer> = [
    {
      title: "#",
      dataIndex: "index",
      key: "index",
      width: 50,
      render: (_: any, __: any, idx: number) => (pagination.page - 1) * pagination.limit + idx + 1,
    },
    {
      title: "Mã sản phẩm",
      dataIndex: "code",
      key: "code",
      render: (code: string) => <span style={{ color: '#27ae60', fontWeight: 600 }}>{code}</span>,
    },
    {
      title: "Ngày bắt đầu",
      key: "ngay_bat_dau",
      render: (_: any, record: InformationTimer) => {
        const firstTank = record.tanks[0];
        if (!firstTank) return "-";
        return dayjs.unix(firstTank.timeIn).format("DD-MM-YYYY");
      },
    },
    {
      title: "Giờ vào",
      key: "gio_vao",
      render: (_: any, record: InformationTimer) => {
        const firstTank = record.tanks[0];
        if (!firstTank) return "-";
        return dayjs.unix(firstTank.timeIn).format("HH:mm:ss");
      },
    },
    {
      title: "Giờ ra",
      key: "gio_ra",
      render: (_: any, record: InformationTimer) => {
        const lastTank = record.tanks[record.tanks.length - 1];
        if (!lastTank) return "-";
        return dayjs.unix(lastTank.timeOut).format("HH:mm:ss");
      },
    },
    ...tankOrder.map((tank) => {
      // Determine children columns for each tank
      let children: ColumnsType<InformationTimer> = [];
      
      if (["electro_degreasing", "nickel_plating", "dryer"].includes(tank)) {
        children = [
          {
            title: 'Vào',
            key: `${tank}_vao`,
            align: "center" as const,
            render: (_: any, record: InformationTimer) => {
              const tankInfo = record.tanks.find(t => t.name === tank);
              return tankInfo ? dayjs.unix(tankInfo.timeIn).format("HH:mm:ss") : '-';
            },
          },
          {
            title: 'Trong',
            key: `${tank}_trong`,
            align: "center" as const,
            render: (_: any, record: InformationTimer) => {
              const tankInfo = record.tanks.find(t => t.name === tank);
              return tankInfo ? (tankInfo.timeOut - tankInfo.timeIn) : '-';
            },
          },
          {
            title: 'Slot',
            key: `${tank}_slot`,
            align: "center" as const,
            render: (_: any, record: InformationTimer) => {
              const tankInfo = record.tanks.find(t => t.name === tank);
              return tankInfo?.slot ?? '-';
            },
          },
        ];
      } else {
        children = [
          {
            title: 'Vào',
            key: `${tank}_vao`,
            align: "center" as const,
            render: (_: any, record: InformationTimer) => {
              const tankInfo = record.tanks.find(t => t.name === tank);
              return tankInfo ? dayjs.unix(tankInfo.timeIn).format("HH:mm:ss") : '-';
            },
          },
          {
            title: 'Trong',
            key: `${tank}_trong`,
            align: "center" as const,
            render: (_: any, record: InformationTimer) => {
              const tankInfo = record.tanks.find(t => t.name === tank);
              return tankInfo ? (tankInfo.timeOut - tankInfo.timeIn) : '-';
            },
          },
        ];
      }
      
      return {
        title: (
          <div style={{ background: colorMap[tank], padding: 4, borderRadius: 4, minWidth: 90, textAlign: 'center' }}>
            {tankLabels[tank]}
          </div>
        ),
        key: tank,
        align: "center" as const,
        children,
      };
    }),
  ];

  // Add key and index for table rows
  const tableData = data.map((item, idx) => ({
    ...item,
    key: item.code,
    index: idx + 1,
  }));

  return (
    <div className="pt-0">
      <Title level={3} className="mb-6">THÔNG TIN THỜI GIAN</Title>
      <div className="flex flex-row justify-between items-center mb-4 gap-3">
        <Search
          placeholder="Nhập mã sản phẩm hoặc tên sản phẩm để tìm kiếm"
          onSearch={handleSearch}
          allowClear
          style={{ width: 350 }}
        />
        <RangePicker
          style={{ minWidth: 220 }}
          onChange={handleDateChange}
          value={dateRange as any}
          placeholder={["Chọn thời gian", "Chọn thời gian"]}
        />
        <Select
          style={{ minWidth: 180 }}
          placeholder="Chọn hồ"
          allowClear
          value={selectedTank}
          onChange={handleTankChange}
          options={tankGroups?.map(tg => ({ label: tg.name, value: tg.key }))}
        />
        <Button icon={<ExportOutlined />} type="default" onClick={() => handleExportExcel(searchText)}>Xuất Excel</Button>
      </div>
      <Table
        columns={columns}
        dataSource={tableData}
        loading={loading}
        rowKey={(record) => record.code}
        pagination={{
          current: pagination.page,
          pageSize: pagination.limit,
          total: pagination.totalDocs,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
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
      `}</style>
    </div>
  );
};

export default InformationTimerPage; 