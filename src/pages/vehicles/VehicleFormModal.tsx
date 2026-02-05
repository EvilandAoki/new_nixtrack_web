import React, { useEffect, useState } from 'react'
import { Modal, Form, Input, Select, Switch, Row, Col, message } from 'antd'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { createVehicle, updateVehicle } from '@/features/vehicles/vehiclesSlice'
import { fetchClients } from '@/features/clients/clientsSlice'
import type { Vehicle, VehicleFormData, Client } from '@/types'

const { Option } = Select

interface VehicleFormModalProps {
  visible: boolean
  vehicle: Vehicle | null
  onClose: (refresh?: boolean) => void
}

const VehicleFormModal: React.FC<VehicleFormModalProps> = ({ visible, vehicle, onClose }) => {
  const [form] = Form.useForm()
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(false)

  const { user } = useAppSelector((state) => state.auth)
  const { items: clients = [], loading: loadingClients } = useAppSelector((state) => state.clients)

  useEffect(() => {
    // Cargar clientes cada vez que se abre el modal
    if (visible) {
      console.log('Cargando clientes para selector de vehículos...')
      dispatch(fetchClients({ limit: 1000, is_active: 1 }))
        .unwrap()
        .then((response) => {
          console.log('Clientes cargados:', response)
        })
        .catch((error) => {
          console.error('Error cargando clientes:', error)
          message.error('Error al cargar la lista de clientes')
        })
    }
  }, [visible, dispatch])

  useEffect(() => {
    if (visible) {
      if (vehicle) {
        // Modo edición
        form.setFieldsValue({
          client_id: vehicle.client_id,
          license_plate: vehicle.license_plate,
          brand: vehicle.brand,
          vehicle_type: vehicle.vehicle_type,
          model_year: vehicle.model_year,
          color: vehicle.color,
          capacity: vehicle.capacity,
          container: vehicle.container,
          serial_numbers: vehicle.serial_numbers,
          is_escort_vehicle: vehicle.is_escort_vehicle === 1,
          is_active: vehicle.is_active === 1,
        })
      } else {
        // Modo creación
        form.resetFields()
        form.setFieldsValue({
          client_id: user?.client_id || undefined,
          is_escort_vehicle: false,
          is_active: true,
        })
      }
    }
  }, [visible, vehicle, form, user])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      const formData: VehicleFormData = {
        client_id: values.client_id,
        license_plate: values.license_plate.toUpperCase(),
        brand: values.brand,
        vehicle_type: values.vehicle_type,
        model_year: values.model_year,
        color: values.color,
        capacity: values.capacity || '',
        container: values.container || '',
        serial_numbers: values.serial_numbers || '',
        is_escort_vehicle: values.is_escort_vehicle ? 1 : 0,
        is_active: values.is_active ? 1 : 0,
      }

      setLoading(true)

      if (vehicle) {
        // Actualizar
        await dispatch(updateVehicle({ id: vehicle.id, data: formData })).unwrap()
      } else {
        // Crear
        await dispatch(createVehicle(formData)).unwrap()
      }

      onClose(true)
    } catch (error: any) {
      if (error.errorFields) {
        message.error('Por favor complete todos los campos requeridos')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title={vehicle ? 'Editar Vehículo' : 'Nuevo Vehículo'}
      open={visible}
      onOk={handleSubmit}
      onCancel={() => onClose()}
      confirmLoading={loading}
      width={800}
      okText={vehicle ? 'Actualizar' : 'Crear'}
      cancelText="Cancelar"
    >
      <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="client_id"
              label="Cliente"
              rules={[{ required: true, message: 'El cliente es requerido' }]}
            >
              <Select
                placeholder={loadingClients ? "Cargando clientes..." : "Seleccione un cliente"}
                showSearch
                optionFilterProp="children"
                disabled={user?.role_id !== 1 || loadingClients}
                loading={loadingClients}
                filterOption={(input, option) =>
                  String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                }
                notFoundContent={loadingClients ? "Cargando..." : "No hay clientes disponibles"}
              >
                {(clients || []).map((client: Client) => (
                  <Option key={client.id_client} value={client.id_client}>
                    {client.company_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            {!loadingClients && clients.length === 0 && (
              <div style={{ marginTop: -16, marginBottom: 16, padding: 8, background: '#fff7e6', border: '1px solid #ffd591', borderRadius: 4 }}>
                <p style={{ margin: 0, color: '#d46b08', fontSize: 12 }}>
                  <strong>Nota:</strong> No hay clientes disponibles. Debe crear clientes primero en el módulo de Clientes.
                </p>
              </div>
            )}
          </Col>

          <Col span={12}>
            <Form.Item
              name="license_plate"
              label="Placa"
              rules={[
                { required: true, message: 'La placa es requerida' },
                { max: 10, message: 'Máximo 10 caracteres' },
                {
                  pattern: /^[A-Z0-9]+$/i,
                  message: 'Solo letras y números',
                },
              ]}
            >
              <Input
                placeholder="Ej: ABC123"
                style={{ textTransform: 'uppercase' }}
                maxLength={10}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="brand"
              label="Marca"
              rules={[
                { required: true, message: 'La marca es requerida' },
                { max: 50, message: 'Máximo 50 caracteres' },
              ]}
            >
              <Input placeholder="Ej: Chevrolet" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="vehicle_type"
              label="Tipo de Vehículo"
              rules={[
                { required: true, message: 'El tipo es requerido' },
                { max: 50, message: 'Máximo 50 caracteres' },
              ]}
            >
              <Select placeholder="Seleccione el tipo">
                <Option value="Camión">Camión</Option>
                <Option value="Tracto camión">Tracto camión</Option>
                <Option value="Camioneta">Camioneta</Option>
                <Option value="Automóvil">Automóvil</Option>
                <Option value="Motocicleta">Motocicleta</Option>
                <Option value="Otro">Otro</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="model_year"
              label="Año Modelo"
              rules={[
                { required: true, message: 'El año es requerido' },
                { max: 4, message: 'Máximo 4 caracteres' },
              ]}
            >
              <Input placeholder="Ej: 2020" maxLength={4} />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="color"
              label="Color"
              rules={[
                { required: true, message: 'El color es requerido' },
                { max: 30, message: 'Máximo 30 caracteres' },
              ]}
            >
              <Input placeholder="Ej: Blanco" />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item name="capacity" label="Capacidad">
              <Input placeholder="Ej: 5 toneladas" maxLength={50} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="container" label="Contenedor/Remolque">
              <Input placeholder="Número de contenedor" maxLength={50} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name="serial_numbers" label="Números de Serie">
              <Input placeholder="VIN, Motor, Chasis" maxLength={255} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="is_escort_vehicle" label="¿Es vehículo de escolta?" valuePropName="checked">
              <Switch checkedChildren="Sí" unCheckedChildren="No" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name="is_active" label="Estado" valuePropName="checked">
              <Switch checkedChildren="Activo" unCheckedChildren="Inactivo" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

export default VehicleFormModal
