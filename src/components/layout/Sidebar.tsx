import React from 'react'
import { Layout, Menu } from 'antd'
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  CarOutlined,
  UserSwitchOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '@/store/hooks'
import { ROLES } from '@/types'

const { Sider } = Layout

interface SidebarProps {
  collapsed: boolean
  onCollapse: (collapsed: boolean) => void
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onCollapse }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAppSelector((state) => state.auth)

  const isAdmin = user?.role_id === ROLES.ADMIN
  const isAdminClient = user?.role_id === ROLES.SUPERVISOR

  const allMenuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      visible: true,
    },
    {
      key: 'administration',
      icon: <TeamOutlined />,
      label: 'Administración',
      visible: isAdmin || isAdminClient,
      children: [
        {
          key: '/users',
          icon: <UserOutlined />,
          label: 'Usuarios',
          visible: isAdmin,
        },
        {
          key: '/clients',
          icon: <TeamOutlined />,
          label: 'Clientes',
          visible: isAdmin,
        },
        {
          key: '/vehicles',
          icon: <CarOutlined />,
          label: 'Vehículos',
          visible: isAdmin || isAdminClient,
        },
        {
          key: '/agents',
          icon: <UserSwitchOutlined />,
          label: 'Escoltas',
          visible: isAdmin || isAdminClient,
        },
      ],
    },
    {
      key: '/orders',
      icon: <FileTextOutlined />,
      label: 'Seguimientos',
      visible: true,
    },
  ]

  // Filtrar y limpiar items para el menú (remover la propiedad 'visible')
  const menuItems = allMenuItems
    .filter((item) => item.visible)
    .map((item) => {
      const { visible, children, ...rest } = item as any
      if (children) {
        return {
          ...rest,
          children: children.filter((child: any) => child.visible).map(({ visible, ...childRest }: any) => childRest),
        }
      }
      return rest
    })

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key !== 'administration') {
      navigate(key)
    }
  }

  const selectedKey = location.pathname
  const openKeys = menuItems
    .filter((item) => item.children && item.children.some((child: { key: string }) => child.key === selectedKey))
    .map((item) => item.key)

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      breakpoint="lg"
      theme="dark"
      width={250}
    >
      <div className="logo">
        <h1>{collapsed ? 'NT' : 'NixTrack'}</h1>
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        defaultOpenKeys={openKeys}
        onClick={handleMenuClick}
        items={menuItems}
      />
    </Sider>
  )
}

export default Sidebar
