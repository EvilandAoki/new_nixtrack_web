import React, { useEffect, useState } from 'react'
import {
  Card,
  Tabs,
  Descriptions,
  Tag,
  Button,
  Space,
  Spin,
  Table,
  Modal,
  Form,
  DatePicker,
  Input,
} from 'antd'
import {
  ArrowLeftOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchOrderById, finalizeOrder, cancelOrder, activateOrder } from '@/features/orders/ordersSlice'
import { fetchOrderDetails } from '@/features/orders/orderDetailsSlice'
import type { OrderDetail } from '@/types'
import { ORDER_STATUS } from '@/types'
import PageHeader from '@/components/common/PageHeader'
import OrderDetailFormModal from './OrderDetailFormModal'
import dayjs from 'dayjs'

const { TabPane } = Tabs
const { TextArea } = Input

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { selected: order, loading } = useAppSelector((state) => state.orders)
  const { items: details = [], loading: loadingDetails } = useAppSelector((state) => state.orderDetails)

  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [finalizeModalVisible, setFinalizeModalVisible] = useState(false)
  const [cancelModalVisible, setCancelModalVisible] = useState(false)
  const [finalizeForm] = Form.useForm()
  const [cancelForm] = Form.useForm()

  useEffect(() => {
    if (id && !isNaN(Number(id))) {
      dispatch(fetchOrderById(Number(id)))
      dispatch(fetchOrderDetails(Number(id)))
    }
  }, [id, dispatch])

  const handleActivate = async () => {
    if (!order) return
    await dispatch(activateOrder(order.id))
    dispatch(fetchOrderById(order.id))
  }

  const handleFinalize = async () => {
    if (!order) return
    try {
      const values = await finalizeForm.validateFields()
      await dispatch(
        finalizeOrder({
          id: order.id,
          arrivalDate: values.arrival_at.format('YYYY-MM-DD HH:mm:ss'),
        })
      )
      setFinalizeModalVisible(false)
      finalizeForm.resetFields()
      dispatch(fetchOrderById(order.id))
    } catch (error) {
      console.error('Error finalizando:', error)
    }
  }

  const handleCancel = async () => {
    if (!order) return
    try {
      const values = await cancelForm.validateFields()
      await dispatch(cancelOrder({ id: order.id, reason: values.reason }))
      setCancelModalVisible(false)
      cancelForm.resetFields()
      dispatch(fetchOrderById(order.id))
    } catch (error) {
      console.error('Error cancelando:', error)
    }
  }

  const handleDetailModalClose = (refresh?: boolean) => {
    setDetailModalVisible(false)
    if (refresh && id) {
      dispatch(fetchOrderDetails(Number(id)))
    }
  }

  const detailColumns = [
    {
      title: 'Fecha',
      dataIndex: 'reported_at',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
      width: 140,
    },
    {
      title: 'Punto de Reporte',
      dataIndex: 'location_name',
      width: 200,
    },
    {
      title: 'Novedad',
      dataIndex: 'sequence_number',
      render: (seq: 0 | 1) => (
        <Tag color={seq === 1 ? 'green' : 'orange'}>{seq === 1 ? 'Sin Novedad' : 'Con Novedad'}</Tag>
      ),
      width: 130,
    },
    {
      title: 'Observaciones',
      dataIndex: 'notes',
      ellipsis: true,
    },
    {
      title: 'Reportado por',
      dataIndex: 'reported_by',
      width: 150,
    },
  ]

  if (loading || !order) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    )
  }

  const canCreateReport = order.status_id === ORDER_STATUS.IN_TRANSIT
  const canFinalize = order.status_id === ORDER_STATUS.IN_TRANSIT
  const canActivate = order.status_id === ORDER_STATUS.PENDING
  const canCancel = order.status_id !== ORDER_STATUS.DELIVERED && order.status_id !== ORDER_STATUS.CANCELLED

  return (
    <div>
      <PageHeader
        title={`Orden: ${order.order_number}`}
        extra={
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/orders')}>
              Volver
            </Button>
            {canActivate && (
              <Button type="primary" onClick={handleActivate}>
                Activar Orden
              </Button>
            )}
            {canFinalize && (
              <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => setFinalizeModalVisible(true)}>
                Finalizar
              </Button>
            )}
            {canCancel && (
              <Button danger icon={<CloseCircleOutlined />} onClick={() => setCancelModalVisible(true)}>
                Cancelar
              </Button>
            )}
          </Space>
        }
      />

      <Card>
        <Tabs defaultActiveKey="1">
          <TabPane tab="Reportes/Detalles" key="1">
            <Space direction="vertical" style={{ width: '100%' }}>
              {canCreateReport && (
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setDetailModalVisible(true)}>
                  Crear Reporte
                </Button>
              )}
              <Table
                columns={detailColumns}
                dataSource={details}
                loading={loadingDetails}
                rowKey="id"
                pagination={false}
              />
            </Space>
          </TabPane>

          <TabPane tab="Información General" key="2">
            <Descriptions bordered column={2}>
              <Descriptions.Item label="# Orden">{order.order_number}</Descriptions.Item>
              <Descriptions.Item label="# Manifiesto">{order.manifest_number}</Descriptions.Item>
              <Descriptions.Item label="Cliente">{order.client?.company_name}</Descriptions.Item>
              <Descriptions.Item label="Vehículo">{order.vehicle?.license_plate}</Descriptions.Item>
              <Descriptions.Item label="Conductor">{order.driver_name}</Descriptions.Item>
              <Descriptions.Item label="Móvil Conductor">{order.driver_mobile}</Descriptions.Item>
              <Descriptions.Item label="Origen">{order.origin_city?.name}</Descriptions.Item>
              <Descriptions.Item label="Destino">{order.destination_city?.name}</Descriptions.Item>
              <Descriptions.Item label="Fecha Salida">
                {dayjs(order.departure_at).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Fecha Llegada">
                {order.arrival_at ? dayjs(order.arrival_at).format('DD/MM/YYYY HH:mm') : 'Pendiente'}
              </Descriptions.Item>
              <Descriptions.Item label="Distancia (km)">{order.distance_km}</Descriptions.Item>
              <Descriptions.Item label="Tiempo Estimado">{order.estimated_time}</Descriptions.Item>
              <Descriptions.Item label="Aseguradora">{order.insurance_company || '-'}</Descriptions.Item>
              <Descriptions.Item label="Escolta">
                {order.escort ? `${order.escort.name} (${order.escort.mobile})` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Ruta" span={2}>
                {order.route_description}
              </Descriptions.Item>
              <Descriptions.Item label="Restricciones" span={2}>
                {order.restrictions || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Observaciones" span={2}>
                {order.notes || '-'}
              </Descriptions.Item>
            </Descriptions>
          </TabPane>

          <TabPane tab="Archivos" key="3">
            <p>Gestión de archivos de la orden (por implementar)</p>
          </TabPane>
        </Tabs>
      </Card>

      {order && (
        <OrderDetailFormModal
          visible={detailModalVisible}
          orderId={order.id}
          onClose={handleDetailModalClose}
        />
      )}

      <Modal
        title="Finalizar Orden"
        open={finalizeModalVisible}
        onOk={handleFinalize}
        onCancel={() => setFinalizeModalVisible(false)}
        okText="Finalizar"
        cancelText="Cancelar"
      >
        <Form form={finalizeForm} layout="vertical">
          <Form.Item
            name="arrival_at"
            label="Fecha y Hora de Llegada"
            rules={[{ required: true, message: 'La fecha de llegada es requerida' }]}
          >
            <DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Cancelar Orden"
        open={cancelModalVisible}
        onOk={handleCancel}
        onCancel={() => setCancelModalVisible(false)}
        okText="Cancelar Orden"
        okType="danger"
        cancelText="Cerrar"
      >
        <Form form={cancelForm} layout="vertical">
          <Form.Item
            name="reason"
            label="Motivo de Cancelación"
            rules={[{ required: true, message: 'El motivo es requerido' }]}
          >
            <TextArea rows={4} placeholder="Indique el motivo de la cancelación" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default OrderDetailPage
