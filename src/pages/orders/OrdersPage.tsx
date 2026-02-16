import React, { useEffect, useState } from 'react'
import { Card, Button, Table, Space, Input, Select, Tag, Modal, DatePicker } from 'antd'
import {
  PlusOutlined,
  EyeOutlined,
  SearchOutlined,
  ExclamationCircleOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchOrders, deleteOrder } from '@/features/orders/ordersSlice'
import type { Order } from '@/types'
import { ORDER_STATUS } from '@/types'
import PageHeader from '@/components/common/PageHeader'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'

const { Search } = Input
const { Option } = Select
const { RangePicker } = DatePicker

const OrdersPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { items, loading, pagination } = useAppSelector((state) => state.orders)
  const { user } = useAppSelector((state) => state.auth)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined)
  const [dateRange, setDateRange] = useState<[string, string] | null>(null)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = (params = {}) => {
    const filters: any = {
      page: pagination?.current_page || 1,
      limit: pagination?.per_page || 15,
      search,
      status_id: statusFilter,
      ...params,
    }

    if (dateRange) {
      filters.date_from = dateRange[0]
      filters.date_to = dateRange[1]
    }

    // Si no es admin/operador/supervisor, filtrar por cliente
    // Roles exentos: Admin (1), Supervisor (2), Operador (3)
    if (user && user.client_id && ![1, 2, 3].includes(user.role_id)) {
      filters.client_id = user.client_id
    }

    dispatch(fetchOrders(filters))
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    loadOrders({ search: value, page: 1 })
  }

  const handleStatusFilterChange = (value: number | undefined) => {
    setStatusFilter(value)
    loadOrders({ status_id: value, page: 1 })
  }

  const handleDateRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      const range: [string, string] = [
        dates[0].format('YYYY-MM-DD'),
        dates[1].format('YYYY-MM-DD'),
      ]
      setDateRange(range)
      loadOrders({ date_from: range[0], date_to: range[1], page: 1 })
    } else {
      setDateRange(null)
      loadOrders({ date_from: undefined, date_to: undefined, page: 1 })
    }
  }

  const handleTableChange = (pagination: any) => {
    loadOrders({ page: pagination.current, limit: pagination.pageSize })
  }

  const handleView = (order: Order) => {
    navigate(`/orders/${order.id}`)
  }

  const handleDelete = (order: Order) => {
    Modal.confirm({
      title: '¿Confirmar eliminación?',
      icon: <ExclamationCircleOutlined />,
      content: `¿Está seguro que desea eliminar la orden "${order.order_number}"?`,
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        await dispatch(deleteOrder(order.id))
        loadOrders()
      },
    })
  }

  const getStatusTag = (statusId: number) => {
    const statusMap: Record<number, { label: string; color: string }> = {
      [ORDER_STATUS.PENDING]: { label: 'Planeado', color: 'default' },
      [ORDER_STATUS.IN_TRANSIT]: { label: 'Activo', color: 'processing' },
      [ORDER_STATUS.AT_CHECKPOINT]: { label: 'En Punto', color: 'warning' },
      [ORDER_STATUS.DELIVERED]: { label: 'Finalizado', color: 'success' },
      [ORDER_STATUS.CANCELLED]: { label: 'Cancelado', color: 'error' },
      [ORDER_STATUS.DELAYED]: { label: 'Retrasado', color: 'warning' },
      [ORDER_STATUS.INCIDENT]: { label: 'Incidente', color: 'error' },
    }
    const status = statusMap[statusId] || { label: 'Desconocido', color: 'default' }
    return <Tag color={status.color}>{status.label}</Tag>
  }

  const getStatusLevelTag = (level: string | null) => {
    if (!level) return <Tag>-</Tag>
    const colorMap: Record<string, string> = {
      verde: 'green',
      amarillo: 'orange',
      rojo: 'red',
    }
    return <Tag color={colorMap[level]}>{level.toUpperCase()}</Tag>
  }

  const columns: ColumnsType<Order> = [
    {
      title: 'Orden #',
      dataIndex: 'order_number',
      key: 'order_number',
      fixed: 'left',
      width: 120,
    },
    {
      title: 'Cliente',
      dataIndex: ['client', 'company_name'],
      key: 'client_name',
      render: (_, record) => record.client?.company_name || '-',
      width: 180,
    },
    {
      title: 'Vehículo',
      dataIndex: ['vehicle', 'license_plate'],
      key: 'vehicle_plate',
      render: (_, record) => record.vehicle?.license_plate || '-',
      width: 100,
    },
    {
      title: 'Origen',
      dataIndex: ['origin_city', 'name'],
      key: 'origin',
      render: (_, record) => record.origin_city?.name || '-',
      width: 130,
    },
    {
      title: 'Destino',
      dataIndex: ['destination_city', 'name'],
      key: 'destination',
      render: (_, record) => record.destination_city?.name || '-',
      width: 130,
    },
    {
      title: 'Fecha Salida',
      dataIndex: 'departure_at',
      key: 'departure_at',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
      width: 140,
    },
    {
      title: 'Estado',
      dataIndex: 'status_id',
      key: 'status_id',
      render: (statusId) => getStatusTag(statusId),
      width: 110,
    },
    {
      title: 'Semáforo',
      dataIndex: 'status_level',
      key: 'status_level',
      render: (level) => getStatusLevelTag(level),
      width: 100,
    },
    {
      title: 'Acciones',
      key: 'actions',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleView(record)}>
            Ver
          </Button>
          {user?.role_id === 1 && (
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            >
              Eliminar
            </Button>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Gestión de Seguimientos" />

      <Card>
        <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
          <Space wrap style={{ justifyContent: 'space-between', width: '100%' }}>
            <Space wrap>
              <Search
                placeholder="Buscar por # orden, manifiesto, placa"
                allowClear
                style={{ width: 320 }}
                onSearch={handleSearch}
                loading={loading}
                enterButton={<SearchOutlined />}
              />
              <Select
                placeholder="Estado"
                allowClear
                style={{ width: 140 }}
                onChange={handleStatusFilterChange}
                value={statusFilter}
              >
                <Option value={ORDER_STATUS.PENDING}>Planeado</Option>
                <Option value={ORDER_STATUS.IN_TRANSIT}>Activo</Option>
                <Option value={ORDER_STATUS.DELIVERED}>Finalizado</Option>
                <Option value={ORDER_STATUS.CANCELLED}>Cancelado</Option>
              </Select>
              <RangePicker
                style={{ width: 260 }}
                format="DD/MM/YYYY"
                onChange={handleDateRangeChange}
                placeholder={['Fecha desde', 'Fecha hasta']}
              />
            </Space>

            {user?.role_id === 1 && (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/orders/new')}>
                Nueva Orden
              </Button>
            )}
          </Space>
        </Space>

        <Table
          columns={columns}
          dataSource={items}
          loading={loading}
          rowKey="id"
          pagination={{
            current: pagination?.current_page || 1,
            pageSize: pagination?.per_page || 15,
            total: pagination?.total || 0,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} órdenes`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1400 }}
        />
      </Card>
    </div>
  )
}

export default OrdersPage
