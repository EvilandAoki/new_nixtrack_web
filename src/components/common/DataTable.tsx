import React from 'react'
import { Table, Button, Space } from 'antd'
import { FileExcelOutlined, PrinterOutlined } from '@ant-design/icons'
import type { TableProps } from 'antd'
import type { ColumnType } from 'antd/es/table'

interface DataTableProps<T> extends Omit<TableProps<T>, 'columns'> {
  columns: ColumnType<T>[]
  data: T[]
  loading?: boolean
  pagination?: {
    current: number
    pageSize: number
    total: number
    onChange: (page: number, pageSize: number) => void
  }
  onExport?: () => void
  onPrint?: () => void
  exportData?: any[]
}

function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading,
  pagination,
  onExport,
  onPrint,
  exportData,
  ...rest
}: DataTableProps<T>) {
  return (
    <div>
      {(onExport || onPrint) && (
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <Space>
            {onExport && (
              <Button
                icon={<FileExcelOutlined />}
                onClick={onExport}
                disabled={!data.length}
              >
                Exportar Excel
              </Button>
            )}
            {onPrint && (
              <Button
                icon={<PrinterOutlined />}
                onClick={onPrint}
                disabled={!data.length}
              >
                Imprimir
              </Button>
            )}
          </Space>
        </div>
      )}
      <Table<T>
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={
          pagination
            ? {
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                onChange: pagination.onChange,
                showSizeChanger: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} de ${total} registros`,
                pageSizeOptions: ['10', '25', '50', '100'],
              }
            : false
        }
        scroll={{ x: 'max-content' }}
        {...rest}
      />
    </div>
  )
}

export default DataTable
