"use client";

import React, { useState, useEffect, useContext, createContext } from 'react';
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
  BarsOutlined,
  RobotOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { useAuth } from '@/contexts/AuthContext';
import { loadTranslations } from '@/utils/api';

// Add at the top, after imports
import Image from 'next/image';
import { Menu as AntMenu } from 'antd';
import Cookies from 'js-cookie';

// Language context for i18n
const LanguageContext = createContext({
  lang: 'en',
  setLang: (lang: string) => {},
  t: (key: string) => key,
});

export const useLanguage = () => useContext(LanguageContext);

const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLang] = useState('en');
  const [translations, setTranslations] = useState<Record<string, string>>({});

  // On mount, set lang from cookie if present, and always load translations for current lang
  useEffect(() => {
    const cookieLang = Cookies.get('lang');
    const initialLang = cookieLang || lang;
    setLang(initialLang);
    loadTranslations(initialLang).then(setTranslations).catch(() => setTranslations({}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When lang changes (by user), load translations
  useEffect(() => {
    loadTranslations(lang).then(setTranslations).catch(() => setTranslations({}));
  }, [lang]);

  const t = (key: string) => translations[key] || key;

  // Wrap setLang to also set cookie and update translations immediately
  const setLangAndCookie = (newLang: string) => {
    Cookies.set('lang', newLang, { expires: 365 });
    setLang((prev) => {
      if (prev !== newLang) {
        loadTranslations(newLang).then(setTranslations).catch(() => setTranslations({}));
      }
      return newLang;
    });
  };
  return (
    <LanguageContext.Provider value={{ lang, setLang: setLangAndCookie, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

const { Header, Content } = Layout;
const { Text } = Typography;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { lang, setLang, t } = useLanguage();

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
    /*{
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: <Link href="/dashboard">{t('dashboard')}</Link>,
    },*/
    {
      key: '/plc-control',
      icon: <SettingOutlined />, // You can change to another icon if preferred
      label: <Link href="/plc-control">{t('menu_plc_controller')}</Link>,
    },
    {
      key: '/robot-control',
      icon: <RobotOutlined />,
      label: <Link href="/robot-control">{t('menu_robot_control')}</Link>,
    },
    {
      key: '/products',
      icon: <ShoppingCartOutlined />,
      label: <Link href="/products">{t('menu_product')}</Link>,
      meta: { roles: ['admin', 'manager'] },
    },
    {
      key: '/parameters-setting',
      icon: <BarChartOutlined />,
      label: t('menu_parameter_setting'),
      meta: { roles: ['admin', 'manager'] },
      children: [
        {
          key: '/parameters-setting/electroplating',
          label: <Link href="/parameters-setting/electroplating">{t('menu_electroplating_setting')}</Link>,
        },
        {
          key: '/parameters-setting/temperature',
          label: <Link href="/parameters-setting/temperature">{t('menu_temperature_setting')}</Link>,
        },
        {
          key: '/parameters-setting/timer',
          label: <Link href="/parameters-setting/timer">{t('menu_timer_setting')}</Link>,
        },
        {
          key: '/parameters-setting/robot',
          label: <Link href="/parameters-setting/robot">{t('menu_robot_setting')}</Link>,
        },
        {
          key: '/parameters-setting/chemistry',
          label: <Link href="/parameters-setting/chemistry">{t('menu_chemistry_setting')}</Link>,
        },
      ],
    },
    
    {
      key: '/information',
      icon: <InfoCircleOutlined />,
      label: t('menu_information'),
      meta: { roles: ['admin', 'manager'] },
      children: [
        {
          key: '/information/electroplating',
          label: <Link href="/information/electroplating">{t('menu_information_electroplating')}</Link>,
        },
        {
          key: '/information/temperature',
          label: <Link href="/information/temperature">{t('menu_information_temperature')}</Link>,
        },
        {
          key: '/information/timer',
          label: <Link href="/information/timer">{t('menu_information_timer')}</Link>,
        }
      ],
    },
    {
      key: '/history',
      icon: <HistoryOutlined />,
      label: t('menu_history'),
      children: [
        {
          key: '/history/operation',
          label: <Link href="/history/operation">{t('menu_operation_history')}</Link>,
        },
        {
          key: '/history/chemical-addition',
          label: <Link href="/history/chemical-addition">{t('menu_chemical_addition_history')}</Link>,
        },
        {
          key: '/history/water-addition',
          label: <Link href="/history/water-addition">{t('menu_water_addition_history')}</Link>,
        },
        {
          key: '/history/liquid-warning',
          label: <Link href="/history/liquid-warning">{t('menu_liquid_warning_history')}</Link>,
        },
      ],
    },
    {
      key: '/extend',
      icon: <BarsOutlined />,
      label: t('menu_extend'),
      children: [
        {
          key: '/extend/electric-current',
          label: <Link href="/extend/electric-current">{t('menu_electric_current_info')}</Link>,
        },
        {
          key: '/extend/card-scanner',
          label: <Link href="/extend/card-scanner">{t('menu_card_scanner')}</Link>,
        },
        {
          key: '/extend/maintenance',
          label: <Link href="/extend/maintenance">{t('menu_maintenance')}</Link>,
        }
      ],
    },
  ];

  const userDropdownItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <Link href="/profile">{t('menu_profile')}</Link>,
    },
    {
      key: '/users',
      icon: <TeamOutlined />,
      label: <Link href="/users">{t('menu_users')}</Link>,
      meta: { roles: ['admin'] },
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: <Link href="/settings">{t('menu_settings')}</Link>,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('menu_logout'),
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

  const LANGUAGES = [
    {
      code: 'en',
      label: t('menu_english'),
      short: 'EN',
      flag: '/flags/uk.svg',
    },
    {
      code: 'vi',
      label: t('menu_vietnamese'),
      short: 'VI',
      flag: '/flags/vn.svg',
    },
  ];

  const languageMenuItems = LANGUAGES.map((l) => ({
    key: l.code,
    icon: (
      <Image
        src={l.flag}
        alt={l.label}
        width={24}
        height={24}
        style={{ borderRadius: '50%', background: 'white' }}
      />
    ),
    label: (
      <span
        style={{
          fontWeight: lang === l.code ? 700 : 400,
          color: lang === l.code ? '#001532' : '#000000',
          fontSize: 14,
        }}
      >
        {l.label}
      </span>
    ),
    onClick: () => setLang(l.code),
    style: lang === l.code
      ? { background: 'rgba(255,230,0,0.09)' }
      : {},
  }));

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
        {/* Language dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, position: 'relative' }}>
          <Dropdown
            trigger={['click']}
            open={langDropdownOpen}
            
            onOpenChange={(open) => {
              setLangDropdownOpen(open);
              if (open) setUserDropdownOpen(false);
            }}
            menu={{ items: languageMenuItems }}
          >
            <button
              className={`lang-dropdown-btn${langDropdownOpen ? ' open' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#001532',
                border: 'none',
                color: 'white',
                padding: '0 0 0 8px',
                fontWeight: 600,
                fontSize: 16,
                cursor: 'pointer',
                boxShadow: langDropdownOpen ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
                outline: 'none',
                height: '100%'
           
              }}
              type="button"
            >
              <Image src={LANGUAGES.find(l => l.code === lang)?.flag || ''} alt={lang} width={24} height={24} style={{ borderRadius: '50%', marginRight: 8 }} />
              <span style={{ fontSize: 10 }}>{langDropdownOpen ? <UpOutlined /> : <DownOutlined />}</span>
            </button>
          </Dropdown>
          {user && (
            <Dropdown
              menu={{ items: filteredUserDropdownItems }}
              trigger={['click']}
              
              onOpenChange={(open) => {
                setUserDropdownOpen(open);
                if (open) setLangDropdownOpen(false);
              }}
              open={userDropdownOpen}
            >
              <a onClick={(e) => e.preventDefault()}>
                <Space style={{ color: 'white', marginLeft: 0, cursor: 'pointer' }}>
                  <Avatar icon={<UserOutlined />} />
                  <Text style={{ color: 'white' }}>{user.name}</Text>
                  {userDropdownOpen ? <UpOutlined style={{ fontSize: 10 }}/> : <DownOutlined style={{ fontSize: 10 }}/>} 
                </Space>
              </a>
            </Dropdown>
          )}
        </div>
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

// Wrap the layout with LanguageProvider
export default function DashboardLayoutWithProvider(props: DashboardLayoutProps) {
  return (
    <LanguageProvider>
      <DashboardLayout {...props} />
    </LanguageProvider>
  );
} 