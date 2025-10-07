"use client";

import React, { useEffect, useState } from "react";
import { Table, Typography, message, Input, Button, Space } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { fetchInformationTemperature, InformationTemperature, TankInfo, handleExportExcelTemperature } from "@/services/informationService";
import { ExportOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useLanguage } from '@/components/layout/DashboardLayout';

const { Title } = Typography;
const { Search } = Input;

const tankOrder = [
  "washing",
  "boiling_degreasing",
  "electro_degreasing_tank_1",
  "electro_degreasing_tank_2",
  "pre_nickel_plating",
  "nickel_plating",
  "ultrasonic_hot_rinse",
  "hot_rinse",
  "dryer",
];

const tankLabels: Record<string, string> = {
  washing: "Washing",
  boiling_degreasing: "Boiling Degreasing",
  electro_degreasing_tank_1: "Electro Degreasing 1",
  electro_degreasing_tank_2: "Electro Degreasing 2",
  pre_nickel_plating: "Pre-Nickel",
  nickel_plating: "Nickel Plating",
  ultrasonic_hot_rinse: "Ultrasonic",
  hot_rinse: "Hot rinse",
  dryer: "Dryer",
};

const colorMap: Record<string, string> = {
  washing: "#E8E8E8",
  boiling_degreasing: "#F5F7FA",
  electro_degreasing_tank_1: "#D1F2EB",
  electro_degreasing_tank_2: "#D1F2EB",
  pre_nickel_plating: "#FCF3CF",
  nickel_plating: "#D6EAF8",
  ultrasonic_hot_rinse: "#FDEDEC",
  hot_rinse: "#FADBD8",
  dryer: "#E8DAEF",
};

const InformationTemperaturePage: React.FC = () => {
  const { t } = useLanguage();
  const [data, setData] = useState<InformationTemperature[]>([]);
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

  const loadData = async (page = 1, limit = 10, search = "") => {
    setLoading(true);
    try {
      const res = await fetchInformationTemperature({ page, limit, search });
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
    loadData(pagination.page, pagination.limit, searchText);
    // eslint-disable-next-line
  }, [pagination.page, pagination.limit]);

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
    loadData(1, pagination.limit, value);
  };

  // Helper to download Excel file
  const handleExportExcel = async (search: string) => {
    try {
      await handleExportExcelTemperature({ line: 1, search });
    } catch (error) {
      message.error('Không thể xuất Excel. Vui lòng thử lại!');
    }
  };

  // Helper to find tank for column
  const findTankForColumn = (record: InformationTemperature, columnKey: string) => {
    if (!record?.tanks) return undefined;
    
    if (columnKey === 'electro_degreasing_tank_1' || columnKey === 'electro_degreasing_tank_2') {
      return record.tanks.find(t => t.tank.key === columnKey);
    }
    
    // For other tanks, find by groupKey
    return record.tanks.find(t => t.tank.groupKey === columnKey);
  };

  // Helper to check if slot column should be shown for a tank group
  const shouldShowSlotColumn = (record: InformationTemperature, columnKey: string) => {
    const tankInfo = findTankForColumn(record, columnKey);
    return tankInfo?.tank?.slot !== undefined;
  };

  // Build columns dynamically for tanks
  const columns: ColumnsType<InformationTemperature> = [
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
      render: (_: any, record: InformationTemperature) => {
        const firstTank = record.tanks[0];
        if (!firstTank) return "-";
        return dayjs.unix(firstTank.timeIn).format("DD-MM-YYYY");
      },
    },
    {
      title: "Giờ vào",
      key: "gio_vao",
      render: (_: any, record: InformationTemperature) => {
        const firstTank = record.tanks[0];
        if (!firstTank) return "-";
        return dayjs.unix(firstTank.timeIn).format("HH:mm:ss");
      },
    },
    {
      title: "Giờ ra",
      key: "gio_ra",
      render: (_: any, record: InformationTemperature) => {
        const lastTank = record.tanks[record.tanks.length - 1];
        if (!lastTank) return "-";
        return dayjs.unix(lastTank.timeOut).format("HH:mm:ss");
      },
    },
    ...tankOrder.map((tank) => {
      // Determine children columns for each tank
      let children: ColumnsType<InformationTemperature> = [];
      
      // Base columns for all tanks
      children = [
        {
          title: 'oC',
          key: `${tank}_temperature`,
          align: "center" as const,
          render: (_: any, record: InformationTemperature) => {
            const tankInfo = findTankForColumn(record, tank);
            return tankInfo?.temperature ?? '-';
          },
        },
      ];

      // Add electricity column for tanks that have it
      if (["electro_degreasing_tank_1", "electro_degreasing_tank_2", "pre_nickel_plating", "nickel_plating"].includes(tank)) {
        children.push({
          title: 'A',
          key: `${tank}_electricity`,
          align: "center" as const,
          render: (_: any, record: InformationTemperature) => {
            const tankInfo = findTankForColumn(record, tank);
            return tankInfo?.electricity ?? '-';
          },
        });
      }

      // Add slot column conditionally - only if any record has slot data for this tank
      const hasSlotData = data.some(record => shouldShowSlotColumn(record, tank));
      if (hasSlotData) {
        children.push({
          title: 'Slot',
          key: `${tank}_slot`,
          align: "center" as const,
          render: (_: any, record: InformationTemperature) => {
            const tankInfo = findTankForColumn(record, tank);
            return tankInfo?.tank?.slot ?? tankInfo?.slot ?? '-';
          },
        });
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
      <Title level={3} className="mb-6">{t('temperature_information')}</Title>
      <div className="flex flex-row justify-between items-center mb-4">
        <Search
          placeholder={t('search_product_placeholder')}
          onSearch={handleSearch}
          allowClear
          style={{ width: 350 }}
        />
        <Button icon={<ExportOutlined />} type="default" onClick={() => handleExportExcel(searchText)}>{t('export_excel')}</Button>
      </div>
      <Table
        columns={columns}
        dataSource={tableData}
        loading={loading}
        rowKey={(record) => `${record.code}__${String(record.carrier ?? "")}`}
        pagination={{
          current: pagination.page,
          pageSize: pagination.limit,
          total: pagination.totalDocs,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
          showTotal: (total) => `${t('show_result')}: ${total}`,
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

export default InformationTemperaturePage; 