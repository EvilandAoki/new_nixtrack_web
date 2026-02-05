import React, { useEffect } from 'react'
import { Card, Row, Col, Statistic, Table, Tag, Space, message, Button } from 'antd'
import {
  CarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchActiveOrders, clearError } from '@/features/dashboard/dashboardSlice'
import { formatDateTime } from '@/utils/format'
import type { Order } from '@/types'
import type { ColumnType } from 'antd/es/table'
import './dashboard.css'

const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { activeOrders, isLoading, error, lastUpdate } = useAppSelector(
    (state) => state.dashboard
  )
  const { user } = useAppSelector((state) => state.auth)

  useEffect(() => {
    loadData()
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      loadData()
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [dispatch, user])

  useEffect(() => {
    if (error) {
      message.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])

  const loadData = () => {
    const clientId = user?.role_id === 1 ? undefined : user?.client_id
    dispatch(fetchActiveOrders(clientId))
  }

  const getStatusLevelColor = (level: string | null) => {
    switch (level) {
      case 'verde':
        return 'green'
      case 'amarillo':
        return 'yellow'
      case 'rojo':
        return 'red'
      default:
        return 'default'
    }
  }

  const getStatusLevelText = (level: string | null) => {
    switch (level) {
      case 'verde':
        return 'Al Día'
      case 'amarillo':
        return 'En Espera'
      case 'rojo':
        return 'Sin Reporte'
      default:
        return 'Sin Información'
    }
  }

  const columns: ColumnType<Order>[] = [
    {
      title: 'Orden',
      dataIndex: 'order_number',
      key: 'order_number',
      render: (text, record) => (
        <Button type="link" onClick={() => navigate(`/orders/${record.id}`)}>
          {text}
        </Button>
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'status_level',
      key: 'status_level',
      width: 120,
      render: (level) => (
        <Tag color={getStatusLevelColor(level)}>{getStatusLevelText(level)}</Tag>
      ),
    },
    {
      title: 'Cliente',
      dataIndex: ['client', 'company_name'],
      key: 'client',
    },
    {
      title: 'Vehículo',
      dataIndex: ['vehicle', 'license_plate'],
      key: 'vehicle',
      render: (text, record) => (
        <Space>
          <CarOutlined />
          {text} - {record.vehicle?.brand}
        </Space>
      ),
    },
    {
      title: 'Ruta',
      key: 'route',
      render: (_, record) => (
        <span>
          {record.origin_city?.name || record.origin_city_code} →{' '}
          {record.destination_city?.name || record.destination_city_code}
        </span>
      ),
    },
    {
      title: 'Conductor',
      dataIndex: 'driver_name',
      key: 'driver_name',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <span>{text}</span>
          <span style={{ fontSize: '12px', color: '#888' }}>{record.driver_mobile}</span>
        </Space>
      ),
    },
    {
      title: 'Fecha Salida',
      dataIndex: 'departure_at',
      key: 'departure_at',
      render: (text) => formatDateTime(text),
    },
  ]

  // Mock stats - will be calculated when backend endpoint is available
  const stats = {
    active: activeOrders.length,
    onTime: activeOrders.filter((o) => o.status_level === 'verde').length,
    delayed: activeOrders.filter((o) => o.status_level === 'amarillo').length,
    noReport: activeOrders.filter((o) => o.status_level === 'rojo').length,
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <Space>
          {lastUpdate && (
            <span style={{ color: '#888', fontSize: '14px' }}>
              Última actualización: {formatDateTime(lastUpdate)}
            </span>
          )}
          <Button
            icon={<ReloadOutlined />}
            onClick={loadData}
            loading={isLoading}
          >
            Actualizar
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Seguimientos Activos"
              value={stats.active}
              prefix={<CarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Al Día"
              value={stats.onTime}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="En Espera"
              value={stats.delayed}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Sin Reporte"
              value={stats.noReport}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="Seguimientos Activos"
        extra={
          <Tag color="blue">
            {activeOrders.length} {activeOrders.length === 1 ? 'servicio' : 'servicios'}
          </Tag>
        }
      >
        <Table
          columns={columns}
          dataSource={activeOrders}
          loading={isLoading}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: false }}
          scroll={{ x: 'max-content' }}
          locale={{
            emptyText: 'No hay seguimientos activos en este momento',
          }}
        />
      </Card>

      {/* <Card title="Mapa de Ubicaciones" style={{ marginTop: 16 }}>
        <GoogleMap
          markers={activeOrders
            .filter((order) => {
              // Filtrar órdenes que tengan coordenadas del último reporte
              // TODO: Implementar lógica para obtener última ubicación de cada orden
              return false // Por ahora no mostramos marcadores hasta tener datos reales
            })
            .map((order) => ({
              lat: 0, // TODO: Obtener de order.latest_report.latitude
              lng: 0, // TODO: Obtener de order.latest_report.longitude
              title: order.order_number || '',
              info: `${order.client?.company_name} - ${order.vehicle?.license_plate}`,
            }))}
          height={400}
        />
      </Card> */}
    </div>
  )
}

export default DashboardPage
