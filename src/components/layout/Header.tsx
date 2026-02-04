import React from 'react'
import { Layout, Button, Dropdown, Space, Typography } from 'antd'
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  UserOutlined,
  LogoutOutlined,
  BulbOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logoutUser } from '@/features/auth/authSlice'
import { useTheme } from '@/contexts/ThemeContext'

const { Header: AntHeader } = Layout
const { Text } = Typography

interface HeaderProps {
  collapsed: boolean
  onToggle: () => void
}

const Header: React.FC<HeaderProps> = ({ collapsed, onToggle }) => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { isDarkMode, toggleTheme } = useTheme()

  const handleLogout = async () => {
    await dispatch(logoutUser())
    navigate('/login')
  }

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'theme',
      icon: <BulbOutlined />,
      label: isDarkMode ? 'Modo Claro' : 'Modo Oscuro',
      onClick: toggleTheme,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Cerrar Sesión',
      onClick: handleLogout,
    },
  ]

  return (
    <AntHeader className="site-header">
      <div className="header-content">
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggle}
          className="trigger"
        />

        <Space>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Button type="text" icon={<UserOutlined />}>
              <Text>{user?.name || 'Usuario'}</Text>
            </Button>
          </Dropdown>
        </Space>
      </div>
    </AntHeader>
  )
}

export default Header
