import React, { useEffect, useState } from 'react'
import { Card, Form, Input, Select, Button, DatePicker, Row, Col, Space, Divider, message, InputNumber } from 'antd'
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch } from '@/store/hooks'
import { createOrder, updateOrder } from '@/features/orders/ordersSlice'
import { clientService } from '@/api/services/client.service'
import { vehicleService } from '@/api/services/vehicle.service'
import { agentService } from '@/api/services/agent.service'
import { catalogService } from '@/api/services/catalog.service'
import { orderService } from '@/api/services/order.service'
import type { Client, Vehicle, Agent, City } from '@/types'
import PageHeader from '@/components/common/PageHeader'
import dayjs from 'dayjs'

const { Option } = Select
const { TextArea } = Input

const OrderFormPage: React.FC = () => {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()
    const dispatch = useAppDispatch()
    const [form] = Form.useForm()

    const [loading, setLoading] = useState(false)
    const [clients, setClients] = useState<Client[]>([])
    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    const [agents, setAgents] = useState<Agent[]>([])
    const [cities, setCities] = useState<City[]>([])
    const [isEdit, setIsEdit] = useState(false)

    useEffect(() => {
        loadDependencies()
        if (id && id !== 'new') {
            setIsEdit(true)
            loadOrder(Number(id))
        }
    }, [id])

    const loadDependencies = async () => {
        try {
            const [clientsRes, vehiclesRes, agentsRes, citiesRes] = await Promise.all([
                clientService.getClients({ limit: 100, is_active: 1 }),
                vehicleService.getVehicles({ limit: 100, is_active: 1 }),
                agentService.getAgents({ limit: 100, is_active: 1 }),
                catalogService.getCities()
            ])

            setClients(clientsRes.items)
            setVehicles(vehiclesRes.items)
            setAgents(agentsRes.items)
            setCities(citiesRes)
        } catch (error) {
            console.error('Error loading dependencies:', error)
            message.error('Error al cargar datos necesarios')
        }
    }

    const loadOrder = async (orderId: number) => {
        setLoading(true)
        try {
            const order = await orderService.getOrderById(orderId)
            form.setFieldsValue({
                ...order,
                departure_at: order.departure_at ? dayjs(order.departure_at) : null,
            })
        } catch (error) {
            console.error('Error loading order:', error)
            message.error('Error al cargar la orden')
            navigate('/orders')
        } finally {
            setLoading(false)
        }
    }

    const onFinish = async (values: any) => {
        setLoading(true)
        try {
            const payload = {
                ...values,
                departure_at: values.departure_at ? values.departure_at.format('YYYY-MM-DD HH:mm:ss') : null,
            }

            if (isEdit) {
                await dispatch(updateOrder({ id: Number(id), data: payload })).unwrap()
            } else {
                await dispatch(createOrder(payload)).unwrap()
            }
            navigate('/orders')
        } catch (error) {
            // Rejection is handled by the slice with a message
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <PageHeader
                title={isEdit ? 'Editar Orden' : 'Nueva Orden'}
                extra={
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/orders')}>
                        Volver
                    </Button>
                }
            />

            <Card loading={loading}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{
                        status_id: 1, // Pendiente
                    }}
                >
                    <Divider orientation="left">Información General</Divider>
                    <Row gutter={16}>
                        <Col xs={24} md={8}>
                            <Form.Item
                                name="order_number"
                                label="# Orden / Pedido"
                                rules={[{ required: true, message: 'El número de orden es requerido' }]}
                            >
                                <Input placeholder="Ej: ORD-001" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item
                                name="manifest_number"
                                label="# Manifiesto"
                            >
                                <Input placeholder="Ej: MAN-001" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item
                                name="client_id"
                                label="Cliente"
                                rules={[{ required: true, message: 'El cliente es requerido' }]}
                            >
                                <Select placeholder="Seleccione un cliente" showSearch optionFilterProp="children">
                                    {clients.map(c => (
                                        <Option key={c.id_client} value={c.id_client}>{c.company_name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} md={8}>
                            <Form.Item
                                name="vehicle_id"
                                label="Vehículo"
                            >
                                <Select placeholder="Seleccione un vehículo" showSearch optionFilterProp="children" allowClear>
                                    {vehicles.map(v => (
                                        <Option key={v.id} value={v.id}>{v.license_plate} - {v.brand}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item
                                name="driver_name"
                                label="Nombre Conductor"
                            >
                                <Input placeholder="Nombre del conductor" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item
                                name="driver_mobile"
                                label="Móvil Conductor"
                            >
                                <Input placeholder="Celular" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider orientation="left">Origen y Destino</Divider>
                    <Row gutter={16}>
                        <Col xs={24} md={6}>
                            <Form.Item
                                name="origin_city_code"
                                label="Ciudad Origen"
                            >
                                <Select placeholder="Origen" showSearch optionFilterProp="children">
                                    {cities.map(c => (
                                        <Option key={c.code} value={c.code}>{c.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                            <Form.Item
                                name="destination_city_code"
                                label="Ciudad Destino"
                            >
                                <Select placeholder="Destino" showSearch optionFilterProp="children">
                                    {cities.map(c => (
                                        <Option key={c.code} value={c.code}>{c.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                            <Form.Item
                                name="departure_at"
                                label="Fecha/Hora Estimada Salida"
                            >
                                <DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                            <Form.Item
                                name="estimated_time"
                                label="Tiempo Estimado de Viaje"
                            >
                                <Input placeholder="Ej: 8 horas" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} md={24}>
                            <Form.Item
                                name="route_description"
                                label="Ruta Sugerida"
                            >
                                <TextArea rows={2} placeholder="Descripción de la ruta..." />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider orientation="left">Seguridad y Otros</Divider>
                    <Row gutter={16}>
                        <Col xs={24} md={8}>
                            <Form.Item
                                name="escort_id"
                                label="Acompañante / Escolta"
                            >
                                <Select placeholder="Seleccione escolta" showSearch optionFilterProp="children" allowClear>
                                    {agents.map(a => (
                                        <Option key={a.id} value={a.id}>{a.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item
                                name="insurance_company"
                                label="Aseguradora"
                            >
                                <Input placeholder="Nombre de la aseguradora" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item
                                name="distance_km"
                                label="Distancia (KM)"
                            >
                                <InputNumber style={{ width: '100%' }} placeholder="0" min={0} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24}>
                            <Form.Item
                                name="restrictions"
                                label="Restricciones / Recomendaciones"
                            >
                                <TextArea rows={2} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24}>
                            <Form.Item
                                name="notes"
                                label="Notas Adicionales"
                            >
                                <TextArea rows={3} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={() => navigate('/orders')}>
                                Cancelar
                            </Button>
                            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                                {isEdit ? 'Guardar Cambios' : 'Crear Orden'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    )
}

export default OrderFormPage
