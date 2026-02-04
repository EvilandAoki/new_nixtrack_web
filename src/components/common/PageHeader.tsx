import React from 'react'
import { Typography, Button, Space } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

const { Title } = Typography

interface PageHeaderProps {
  title: string
  onAdd?: () => void
  addButtonText?: string
  extra?: React.ReactNode
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  onAdd,
  addButtonText = 'Agregar',
  extra,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
      }}
    >
      <Title level={2} style={{ margin: 0 }}>
        {title}
      </Title>
      <Space>
        {extra}
        {onAdd && (
          <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
            {addButtonText}
          </Button>
        )}
      </Space>
    </div>
  )
}

export default PageHeader
