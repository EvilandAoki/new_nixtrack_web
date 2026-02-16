
import React, { useEffect, useState } from 'react'
import { Modal, Form, Input, Select, DatePicker, InputNumber, Row, Col, Divider, message } from 'antd'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { updateOrder, fetchOrderById } from '@/features/orders/ordersSlice'
import { fetchClients } from '@/features/clients/clientsSlice'
import { fetchVehicles } from '@/features/vehicles/vehiclesSlice'
import { fetchAgents } from '@/features/agents/agentsSlice'
import { fetchCities } from '@/features/catalog/catalogSlice'
import { Order } from '@/types'
import dayjs from 'dayjs'

const { Option } = Select
const { TextArea } = Input

interface OrderEditModalProps {
    visible: boolean
    order: Order
    onClose: () => void
}

const OrderEditModal: React.FC<OrderEditModalProps> = ({ visible, order, onClose }) => {
    const dispatch = useAppDispatch()
    const [form] = Form.useForm()
    const [submitting, setSubmitting] = useState(false)

    // Selectors
    const { items: clients, loading: loadingClients } = useAppSelector((state) => state.clients)
    const { items: vehicles, loading: loadingVehicles } = useAppSelector((state) => state.vehicles)
    const { items: agents, loading: loadingAgents } = useAppSelector((state) => state.agents)
    const { cities, loading: loadingCities } = useAppSelector((state) => state.catalog)

    useEffect(() => {
        if (visible) {
            // Load Catalogs
            dispatch(fetchClients({ limit: 1000, is_active: 1 }))
            dispatch(fetchVehicles({ limit: 1000, is_active: 1 }))
            dispatch(fetchAgents({ limit: 1000, is_active: 1 }))
            dispatch(fetchCities())

            // Set form values
            form.setFieldsValue({
                ...order,
                departure_at: order.departure_at ? dayjs(order.departure_at) : null,
                // Ensure city codes are used if keys match catalog
                origin_city_code: order.origin_city?.code || order.origin_city_code, // fallback if needed
                destination_city_code: order.destination_city?.code || order.destination_city_code,
                // Ensure object IDs are used
                client_id: order.client?.id_client || order.client_id,
                vehicle_id: order.vehicle?.id || order.vehicle_id,
                escort_id: order.escort?.id || order.escort_id,
            })
        }
    }, [visible, order, dispatch, form])

    const handleOk = async () => {
        try {
            const values = await form.validateFields()
            setSubmitting(true)

            const payload = {
                ...values,
                departure_at: values.departure_at ? values.departure_at.format('YYYY-MM-DD HH:mm:ss') : null,
            }

            await dispatch(updateOrder({ id: order.id, data: payload })).unwrap()

            message.success('Orden actualizada correctamente')
            dispatch(fetchOrderById(order.id)) // Refresh data
            onClose()
        } catch (error) {
            console.error('Validate Failed:', error)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Modal
            title={`Editar Orden: ${order.order_number}`}
            open={visible}
            onOk={handleOk}
            onCancel={onClose}
            confirmLoading={submitting}
            width={1000}
            okText="Guardar Cambios"
            cancelText="Cancelar"
        >
            <Form form={form} layout="vertical">
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
                        <Form.Item name="manifest_number" label="# Manifiesto">
                            <Input placeholder="Ej: MAN-001" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                        <Form.Item name="client_id" label="Cliente" rules={[{ required: true }]}>
                            <Select
                                placeholder="Seleccione un cliente"
                                showSearch
                                optionFilterProp="children"
                                loading={loadingClients}
                            >
                                {clients.map((c) => (
                                    <Option key={c.id_client} value={c.id_client}>
                                        {c.company_name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col xs={24} md={8}>
                        <Form.Item name="vehicle_id" label="Vehículo">
                            <Select
                                placeholder="Seleccione un vehículo"
                                showSearch
                                optionFilterProp="children"
                                allowClear
                                loading={loadingVehicles}
                            >
                                {vehicles.map((v) => (
                                    <Option key={v.id} value={v.id}>
                                        {v.license_plate} - {v.brand}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                        <Form.Item name="driver_name" label="Nombre Conductor">
                            <Input placeholder="Nombre del conductor" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                        <Form.Item name="driver_mobile" label="Móvil Conductor">
                            <Input placeholder="Celular" />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider orientation="left">Origen, Destino y Tiempos</Divider>
                <Row gutter={16}>
                    <Col xs={24} md={6}>
                        <Form.Item name="origin_city_code" label="Ciudad Origen">
                            <Select showSearch optionFilterProp="children" loading={loadingCities}>
                                {cities.map((c) => (
                                    <Option key={c.code} value={c.code}>
                                        {c.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={6}>
                        <Form.Item name="destination_city_code" label="Ciudad Destino">
                            <Select showSearch optionFilterProp="children" loading={loadingCities}>
                                {cities.map((c) => (
                                    <Option key={c.code} value={c.code}>
                                        {c.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={6}>
                        <Form.Item name="departure_at" label="Fecha Salida">
                            <DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={6}>
                        <Form.Item name="estimated_time" label="Tiempo Estimado">
                            <Input placeholder="Ej: 8 horas" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col xs={24}>
                        <Form.Item name="route_description" label="Ruta Sugerida">
                            <TextArea rows={2} />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider orientation="left">Seguridad y Otros</Divider>
                <Row gutter={16}>
                    <Col xs={24} md={8}>
                        <Form.Item name="escort_id" label="Acompañante / Escolta">
                            <Select allowClear showSearch optionFilterProp="children" loading={loadingAgents}>
                                {agents.map((a) => (
                                    <Option key={a.id} value={a.id}>
                                        {a.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                        <Form.Item name="insurance_company" label="Aseguradora">
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                        <Form.Item name="distance_km" label="Distancia (KM)">
                            <InputNumber style={{ width: '100%' }} min={0} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item name="restrictions" label="Restricciones">
                            <TextArea rows={2} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item name="notes" label="Notas / Observaciones">
                            <TextArea rows={2} />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    )
}

export default OrderEditModal
