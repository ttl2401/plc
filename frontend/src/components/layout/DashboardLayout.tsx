"use client";

import React from 'react';
import { Layout, Menu, theme } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  TeamOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useAuth } from '@/contexts/AuthContext';

const { Header, Sider, Content } = Layout;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const allMenuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: <Link href="/dashboard">Dashboard</Link>,
    },
    {
      key: '/products',
      icon: <ShoppingCartOutlined />,
      label: <Link href="/products">Products</Link>,
      meta: { roles: ['admin', 'manager'] },
    },
    {
      key: '/users',
      icon: <TeamOutlined />,
      label: <Link href="/users">Users</Link>,
      meta: { roles: ['admin'] },
    },
    {
      key: '/charts',
      icon: <BarChartOutlined />,
      label: <Link href="/charts">Charts</Link>,
    },
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: <Link href="/profile">Profile</Link>,
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: <Link href="/settings">Settings</Link>,
    },
  ];

  const menuItems = allMenuItems.filter(item => {
    if (!item.meta || !item.meta.roles) {
      return true;
    }
    return user && item.meta.roles.includes(user.role);
  });

  const handleLogout = () => {
    Cookies.remove('auth_token');
    router.push('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        style={{
          background: '#001529',
          display: 'flex',
          flexDirection: 'column',
        }}
        theme="dark"
      >
        <div className="p-4 text-xl font-bold" style={{ color: 'white' }}>PLC Demo</div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
          style={{ flex: 1, background: '#001529' }}
        />
        <Menu
          theme="dark"
          mode="inline"
          selectable={false}
          items={[
            {
              key: 'logout',
              icon: <LogoutOutlined />,
              label: 'Logout',
              onClick: handleLogout,
            },
          ]}
          style={{ background: '#001529' }}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }} />
        <Content style={{ margin: '24px 16px 0' }}>
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