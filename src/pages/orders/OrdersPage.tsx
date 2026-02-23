import React, { useEffect, useState } from 'react'
import { Card, Button, Table, Space, Input, Select, Tag, Modal, DatePicker, message } from 'antd'
import {
  PlusOutlined,
  EyeOutlined,
  SearchOutlined,
  ExclamationCircleOutlined,
  DeleteOutlined,
  DownloadOutlined,
  ClearOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchOrders, deleteOrder } from '@/features/orders/ordersSlice'
import type { Order, Client } from '@/types'
import { ORDER_STATUS } from '@/types'
import { clientService } from '@/api/services/client.service'
import { orderService } from '@/api/services/order.service'
import { exportToExcel } from '@/utils/export'
import PageHeader from '@/components/common/PageHeader'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import '../dashboard/dashboard.css'

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
  const [companyFilter, setCompanyFilter] = useState<number | undefined>(undefined)
  const [clients, setClients] = useState<Client[]>([])
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    loadOrders()
    loadClients()
  }, [])

  const loadClients = async () => {
    if (user && [1, 2, 3].includes(user.role_id)) {
      try {
        const response = await clientService.getClients({ limit: 1000 })
        setClients(response.items || [])
      } catch (error) {
        console.error('Error cargando clientes:', error)
      }
    }
  }

  const loadOrders = (params = {}) => {
    const filters: any = {
      page: pagination?.current_page || 1,
      limit: pagination?.per_page || 15,
      search,
      status_id: statusFilter,
      client_id: companyFilter,
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

  const handleCompanyFilterChange = (value: number | undefined) => {
    setCompanyFilter(value)
    loadOrders({ client_id: value, page: 1 })
  }

  const handleResetFilters = () => {
    setSearch('')
    setStatusFilter(undefined)
    setDateRange(null)
    setCompanyFilter(undefined)

    const defaultFilters: any = {
      page: 1,
      limit: pagination?.per_page || 15,
      search: undefined,
      status_id: undefined,
      client_id: undefined,
      date_from: undefined,
      date_to: undefined,
    }

    if (user && user.client_id && ![1, 2, 3].includes(user.role_id)) {
      defaultFilters.client_id = user.client_id
    }

    dispatch(fetchOrders(defaultFilters))
  }

  const handleExportExcel = async () => {
    try {
      setExporting(true)

      const hasFilters = search || statusFilter || dateRange || companyFilter
      let dataToExport: Order[] = []

      if (hasFilters) {
        const filters: any = {
          limit: 100000,
          search,
          status_id: statusFilter,
          client_id: companyFilter,
        }

        if (dateRange) {
          filters.date_from = dateRange[0]
          filters.date_to = dateRange[1]
        }

        if (user && user.client_id && ![1, 2, 3].includes(user.role_id)) {
          filters.client_id = user.client_id
        }

        const response = await orderService.getOrders(filters)
        dataToExport = response.items || []
      } else {
        dataToExport = items
      }

      const getStatusText = (statusId: number) => {
        const statusMap: Record<number, string> = {
          [ORDER_STATUS.PENDING]: 'Planeado',
          [ORDER_STATUS.IN_TRANSIT]: 'Activo',
          [ORDER_STATUS.AT_CHECKPOINT]: 'En Punto',
          [ORDER_STATUS.DELIVERED]: 'Finalizado',
          [ORDER_STATUS.CANCELLED]: 'Cancelado',
          [ORDER_STATUS.DELAYED]: 'Retrasado',
          [ORDER_STATUS.INCIDENT]: 'Incidente',
        }
        return statusMap[statusId] || 'Desconocido'
      }

      const formattedData = dataToExport.map((order) => ({
        'Orden #': order.order_number,
        Cliente: order.client?.company_name || '-',
        Vehículo: order.vehicle?.license_plate || '-',
        Origen: order.origin_city?.name || '-',
        Destino: order.destination_city?.name || '-',
        'Fecha Salida': order.departure_at ? dayjs(order.departure_at).format('DD/MM/YYYY HH:mm') : '-',
        Estado: getStatusText(order.status_id),
      }))

      exportToExcel(formattedData, 'seguimientos', 'Órdenes')

      message.success('Excel exportado correctamente')
    } catch (error) {
      console.error('Error exportando a Excel:', error)
      message.error('Ocurrió un error al exportar el Excel')
    } finally {
      setExporting(false)
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
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                loading={loading}
                enterButton={<SearchOutlined />}
              />
              {user && [1, 2, 3].includes(user.role_id) && (
                <Select
                  placeholder="Empresa"
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  style={{ width: 220 }}
                  onChange={handleCompanyFilterChange}
                  value={companyFilter}
                >
                  {clients.map(client => (
                    <Option key={client.id_client} value={client.id_client}>
                      {client.company_name}
                    </Option>
                  ))}
                </Select>
              )}
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
                value={dateRange ? [dayjs(dateRange[0]), dayjs(dateRange[1])] : null}
                placeholder={['Fecha desde', 'Fecha hasta']}
              />
              <Button
                icon={<ClearOutlined />}
                onClick={handleResetFilters}
                title="Limpiar Filtros"
              />
            </Space>

            <Space>
              {user?.role_id === 1 && (
                <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/orders/new')}>
                  Nueva Orden
                </Button>
              )}
              <Button icon={<DownloadOutlined />} onClick={handleExportExcel} loading={exporting}>
                Exportar Excel
              </Button>
            </Space>
          </Space>
        </Space>

        <Table
          columns={columns}
          dataSource={items}
          loading={loading}
          rowKey="id"
          rowClassName={(record) => {
            if (record.status_level === 'yellow') return 'table-row-yellow'
            if (record.status_level === 'red') return 'table-row-red'
            return ''
          }}
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
