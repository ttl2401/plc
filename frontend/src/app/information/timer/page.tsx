"use client";

import React, { useEffect, useState } from "react";
import { Table, Typography, message, Input, Button, Space, DatePicker, Select } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { fetchInformationTimer, InformationTimer, TimerTankInfo, handleExportExcelTimer } from "@/services/informationService";
import { ExportOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { getTankGroup, TankGroup } from "@/services/resourceService";
import moment from "moment";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/layout/DashboardLayout";

const { Title } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;

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
  const [headerNames, setHeaderNames] = useState<Record<string, string>>({});
  const [selectedTank, setSelectedTank] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[moment.Moment | null, moment.Moment | null] | null>(null);
  const router = useRouter();
  const { t } = useLanguage();

  const tankLabels: Record<string, string> = {
    washing: t('washing'),
    boiling_degreasing: t('boiling_degreasing'),
    electro_degreasing: t('electro_degreasing'),
    pre_nickel_plating: t('pre_nickel_plating'),
    nickel_plating: t('nickel_plating'),
    ultrasonic_hot_rinse: t('ultrasonic_hot_rinse'),
    hot_rinse: t('hot_rinse'),
    dryer: t('dryer'),
  };

  const colorMap: Record<string, string> = {
    washing: "#E8E8E8",
    boiling_degreasing: "#F5F7FA",
    electro_degreasing: "#D1F2EB",
    electro_degreasing_tank_1: "#D1F2EB",
    electro_degreasing_tank_2: "#D1F2EB",
    pre_nickel_plating: "#FCF3CF",
    nickel_plating: "#D6EAF8",
    ultrasonic_hot_rinse: "#FDEDEC",
    hot_rinse: "#FADBD8",
    dryer: "#E8DAEF",
  };

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
        const list = res.data as any[];
        setData(list as any);
        // Build header names from data
        const names: Record<string, string> = {};
        for (const item of list) {
          for (const t of item?.tanks || []) {
            const key = t?.tank?.key;
            const group = t?.tank?.groupKey;
            const name = t?.tank?.name;
            if (!name) continue;
            if (key === 'electro_degreasing_tank_1') names['electro_degreasing_tank_1'] = names['electro_degreasing_tank_1'] || name;
            if (key === 'electro_degreasing_tank_2') names['electro_degreasing_tank_2'] = names['electro_degreasing_tank_2'] || name;
            if (group && !names[group]) names[group] = name;
            if (key && key.startsWith('nickel_plating_tank_')) names['nickel_plating'] = names['nickel_plating'] || name;
            if (key && key.startsWith('dryer_tank_')) names['dryer'] = names['dryer'] || name;
          }
        }
        setHeaderNames(names);
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

  // Helpers for new API shape
  const findTankForColumn = (record: any, columnKey: string) => {
    if (!record?.tanks) return undefined;
    if (columnKey === 'electro_degreasing_tank_1' || columnKey === 'electro_degreasing_tank_2') {
      return record.tanks.find((t: any) => t?.tank?.key === columnKey);
    }
    if (columnKey === 'nickel_plating') {
      const keys = ['nickel_plating_tank_1', 'nickel_plating_tank_2', 'nickel_plating_tank_3'];
      return record.tanks.find((t: any) => keys.includes(t?.tank?.key));
    }
    if (columnKey === 'dryer') {
      const keys = ['dryer_tank_1', 'dryer_tank_2'];
      return record.tanks.find((t: any) => keys.includes(t?.tank?.key));
    }
    // default: first tank in this groupKey
    const groupKey = columnKey;
    return record.tanks.find((t: any) => t?.tank?.groupKey === groupKey);
  };

  const formatTime = (iso?: string | null) => {
    if (!iso) return '-';
    const d = dayjs(iso);
    if (!d.isValid()) return '-';
    return d.format('HH:mm:ss');
  };

  const calcDurationSeconds = (enterIso?: string | null, exitIso?: string | null) => {
    if (!enterIso || !exitIso) return '-';
    const a = dayjs(exitIso);
    const b = dayjs(enterIso);
    if (!a.isValid() || !b.isValid()) return '-';
    return a.unix() - b.unix();
  };

  const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const formatDurationDisplay = (val: any) => {
    if (val === '-' || val == null) return '-';
    const seconds = Number(val);
    if (!Number.isFinite(seconds) || seconds < 0) return '-';
    if (seconds < 60) return `${seconds}`;
    if (seconds < 3600) {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${pad2(m)}:${pad2(s)}`;
    }
    const h = Math.floor(seconds / 3600);
    const rem = seconds % 3600;
    const m = Math.floor(rem / 60);
    const s = rem % 60;
    return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
  };

  // Build columns dynamically for tanks
  const columns: ColumnsType<InformationTimer> = [
    {
      title: t("table_index"),
      dataIndex: "index",
      key: "index",
      width: 50,
      render: (_: any, __: any, idx: number) => (pagination.page - 1) * pagination.limit + idx + 1,
    },
    {
      title: t("product_code"),
      dataIndex: "productCode",
      key: "productCode",
      render: (code: string) => <span style={{ color: '#27ae60', fontWeight: 600 }}>{code}</span>,
    },
    {
      title: t("start_date"),
      key: "ngay_bat_dau",
      render: (_: any, record: any) => {
        const first = record?.tanks?.find((t: any) => !!t?.enteredAt);
        return first?.enteredAt ? dayjs(first.enteredAt).format("DD-MM-YYYY") : '-';
      },
    },
    {
      title: t("time_in"),
      key: "gio_vao",
      render: (_: any, record: any) => {
        const first = record?.tanks?.find((t: any) => !!t?.enteredAt);
        return first?.enteredAt ? dayjs(first.enteredAt).format("HH:mm:ss") : '-';
      },
    },
    {
      title: t("time_out"),
      key: "gio_ra",
      render: (_: any, record: any) => {
        const last = [...(record?.tanks || [])].reverse().find((t: any) => !!t?.exitedAt);
        return last?.exitedAt ? dayjs(last.exitedAt).format("HH:mm:ss") : '-';
      },
    },
    ...tankOrder.map((tank) => {
      // Determine children columns for each tank
      let children: ColumnsType<InformationTimer> = [];
      
      if (["nickel_plating", "dryer"].includes(tank)) {
        children = [
          {
            title: t("time_in"),
            key: `${tank}_vao`,
            align: "center" as const,
            render: (_: any, record: any) => {
              const tankInfo = findTankForColumn(record, tank);
              return tankInfo ? formatTime(tankInfo.enteredAt) : '-';
            },
          },
          {
            title: t("duration"),
            key: `${tank}_trong`,
            align: "center" as const,
            render: (_: any, record: any) => {
              const tankInfo = findTankForColumn(record, tank);
              return tankInfo ? formatDurationDisplay(calcDurationSeconds(tankInfo.enteredAt, tankInfo.exitedAt)) : '-';
            },
          },
          {
            title: t("slot"),
            key: `${tank}_slot`,
            align: "center" as const,
            render: (_: any, record: any) => {
              const tankInfo = findTankForColumn(record, tank);
              return tankInfo?.tank?.slot ?? '-';
            },
          },
        ];
      } else {
        children = [
          {
            title: t("time_in"),
            key: `${tank}_vao`,
            align: "center" as const,
            render: (_: any, record: any) => {
              const tankInfo = findTankForColumn(record, tank);
              return tankInfo ? formatTime(tankInfo.enteredAt) : '-';
            },
          },
          {
            title: t("duration"),
            key: `${tank}_trong`,
            align: "center" as const,
            render: (_: any, record: any) => {
              const tankInfo = findTankForColumn(record, tank);
              return tankInfo ? formatDurationDisplay(calcDurationSeconds(tankInfo.enteredAt, tankInfo.exitedAt)) : '-';
            },
          },
        ];
      }
      
      return {
        title: (
          <div style={{ background: colorMap[tank], padding: 4, borderRadius: 4, minWidth: 90, textAlign: 'center' }}>
            {headerNames[tank] || tank}
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
      <Title level={3} className="mb-6">{t('timer_information')}</Title>
      <div className="flex flex-row justify-between items-center mb-4 gap-3">
        <Search
          placeholder={t('search_product_placeholder')}
          onSearch={handleSearch}
          allowClear
          style={{ width: 350 }}
        />
        <RangePicker
          style={{ minWidth: 220 }}
          onChange={handleDateChange}
          value={dateRange as any}
          placeholder={[t('select_time'), t('select_time')]}
        />
        <Select
          style={{ minWidth: 180 }}
          placeholder={t('select_tank_group')}
          allowClear
          value={selectedTank}
          onChange={handleTankChange}
          options={tankGroups?.map(tg => ({ label: tg.name, value: tg.key }))}
        />
        <Button icon={<ExportOutlined />} type="default" onClick={() => handleExportExcel(searchText)}>{t('export_excel')}</Button>
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
          showTotal: (total) => `${t('show_result')}: ${total}`,
        }}
        onChange={handleTableChange}
        bordered
        scroll={{ x: 'max-content' }}
        onRow={(record) => ({
          onClick: () => router.push(`/information/timer/${record.code}`),
          style: { cursor: 'pointer' },
        })}
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