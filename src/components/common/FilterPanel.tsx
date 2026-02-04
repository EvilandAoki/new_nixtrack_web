import React from 'react'
import { Card, Space, Button } from 'antd'
import { FilterOutlined, ClearOutlined } from '@ant-design/icons'

interface FilterPanelProps {
  children: React.ReactNode
  onClear?: () => void
  title?: string
}

const FilterPanel: React.FC<FilterPanelProps> = ({ children, onClear, title = 'Filtros' }) => {
  return (
    <Card
      title={
        <Space>
          <FilterOutlined />
          {title}
        </Space>
      }
      size="small"
      extra={
        onClear && (
          <Button icon={<ClearOutlined />} size="small" onClick={onClear}>
            Limpiar
          </Button>
        )
      }
      style={{ marginBottom: 16 }}
    >
      {children}
    </Card>
  )
}

export default FilterPanel
