"use client";

import React, { useState } from 'react';
import { Layout, Menu, theme, Dropdown, Space, Avatar, Typography } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  TeamOutlined,
  ShoppingCartOutlined,
  DownOutlined,
  UpOutlined,
  HistoryOutlined,
  InfoCircleOutlined,
  BarsOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { useAuth } from '@/contexts/AuthContext';

const { Header, Content } = Layout;
const { Text } = Typography;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const getSelectedKeys = () => {
    const keys = [pathname];
    if (pathname.startsWith('/parameters-setting/')) {
      keys.push('/parameters-setting');
    }
    return keys;
  };

  const mainMenuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: <Link href="/dashboard">Dashboard</Link>,
    },
    {
      key: '/products',
      icon: <ShoppingCartOutlined />,
      label: <Link href="/products">Sản Phẩm</Link>,
      meta: { roles: ['admin', 'manager'] },
    },
    {
      key: '/parameters-setting',
      icon: <BarChartOutlined />,
      label: 'Cài đặt thông số',
      meta: { roles: ['admin', 'manager'] },
      children: [
        {
          key: '/parameters-setting/electroplating',
          label: <Link href="/parameters-setting/electroplating">Xi mạ</Link>,
        },
        {
          key: '/parameters-setting/temperature',
          label: <Link href="/parameters-setting/temperature">Nhiệt độ</Link>,
        },
        {
          key: '/parameters-setting/timer',
          label: <Link href="/parameters-setting/timer">Timer</Link>,
        },
        {
          key: '/parameters-setting/robot',
          label: <Link href="/parameters-setting/robot">Robot</Link>,
        },
        {
          key: '/parameters-setting/chemistry',
          label: <Link href="/parameters-setting/chemistry">Hóa chất lỏng</Link>,
        },
      ],
    },
    {
      key: '/information',
      icon: <InfoCircleOutlined />,
      label: 'Thông tin',
      meta: { roles: ['admin', 'manager'] },
      children: [
        {
          key: '/information/electroplating',
          label: <Link href="/information/electroplating">Thông tin xi mạ</Link>,
        },
        {
          key: '/information/temperature',
          label: <Link href="/information/temperature">Thông tin nhiệt độ</Link>,
        },
        {
          key: '/information/timer',
          label: <Link href="/information/timer">Thông tin thời gian</Link>,
        }
      ],
    },
    
    {
      key: '/lich-su',
      icon: <HistoryOutlined />,
      label: 'Lịch Sử',
      children: [
        {
          key: '/lich-su-van-hanh',
          label: <Link href="/lich-su-van-hanh">Lịch Sử Vận Hành</Link>,
        },
        {
          key: '/bo-sung-hoa-chat',
          label: <Link href="/lich-su/bo-sung-hoa-chat">Lịch Sử Bổ Sung Hóa Chất</Link>,
        },
      ],
    },

    {
      key: '/extend',
      icon: <BarsOutlined />,
      label: 'Mở rộng',
      children: [
        {
          key: '/extend/electric-current',
          label: <Link href="/extend/electric-current">Bảng thông tin dòng điện</Link>,
        }
      ],
    },
  ];

  const userDropdownItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <Link href="/profile">Profile</Link>,
    },
    {
      key: '/users',
      icon: <TeamOutlined />,
      label: <Link href="/users">Người dùng</Link>,
      meta: { roles: ['admin'] },
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: <Link href="/settings">Settings</Link>,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: () => {
        logout();
        router.push('/login');
      },
    },
  ];

  const filteredMainMenuItems = mainMenuItems.filter(item => {
    if (!item.meta || !item.meta.roles) {
      return true;
    }
    return user && item.meta.roles.includes(user.role);
  });

  const filteredUserDropdownItems = userDropdownItems.filter(item => {
    if (!item.meta || !item.meta.roles) {
      return true;
    }
    return user && item.meta.roles.includes(user.role);
  });

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          color: 'white',
          fontSize: '16px',
        }}
      >
        <div className="text-xl font-bold">PLC Demo</div>
        
        <div style={{ width: "70%", paddingLeft:"10%", overflowX: 'visible' }}>
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={getSelectedKeys()}
            items={filteredMainMenuItems}
            style={{
              borderBottom: 'none',
              fontSize: '14px',
            }}
          />
        </div>

        {user && (
          <Dropdown
            menu={{ items: filteredUserDropdownItems }}
            trigger={['click']}
            onOpenChange={setDropdownOpen}
            open={dropdownOpen}
          >
            <a onClick={(e) => e.preventDefault()}>
              <Space style={{ color: 'white', marginLeft: 20, cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} />
                <Text style={{ color: 'white' }}>{user.name}</Text>
                {dropdownOpen ? <UpOutlined /> : <DownOutlined />}
              </Space>
            </a>
          </Dropdown>
        )}
      </Header>

      <Layout>
        <Content style={{ margin: 0 }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout; 