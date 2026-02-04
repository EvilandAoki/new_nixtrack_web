import React, { useState } from 'react'
import { Layout } from 'antd'
import Sidebar from './Sidebar'
import Header from './Header'
import './layout.css'

const { Content } = Layout

interface MainLayoutProps {
  children: React.ReactNode
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
      <Layout>
        <Header collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        <Content className="main-content">
          <div className="content-wrapper">{children}</div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout
