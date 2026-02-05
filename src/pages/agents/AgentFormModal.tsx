import React, { useEffect, useState } from 'react'
import { Modal, Form, Input, Select, Switch, Row, Col, message } from 'antd'
import { useAppDispatch } from '@/store/hooks'
import { createAgent, updateAgent } from '@/features/agents/agentsSlice'
import { vehicleService } from '@/api/services/vehicle.service'
import type { Agent, AgentFormData, Vehicle } from '@/types'

const { Option } = Select

interface AgentFormModalProps {
  visible: boolean
  agent: Agent | null
  onClose: (refresh?: boolean) => void
}

const AgentFormModal: React.FC<AgentFormModalProps> = ({ visible, agent, onClose }) => {
  const [form] = Form.useForm()
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(false)
  const [escortVehicles, setEscortVehicles] = useState<Vehicle[]>([])
  const [loadingVehicles, setLoadingVehicles] = useState(false)

  useEffect(() => {
    if (visible) {
      loadEscortVehicles()
      
      if (agent) {
        // Modo edición
        form.setFieldsValue({
          name: agent.name,
          document_id: agent.document_id,
          mobile: agent.mobile,
          vehicle_id: agent.vehicle_id,
          is_active: agent.is_active === 1,
        })
      } else {
        // Modo creación
        form.resetFields()
        form.setFieldsValue({
          is_active: true,
        })
      }
    }
  }, [visible, agent, form])

  const loadEscortVehicles = async () => {
    try {
      setLoadingVehicles(true)
      // Obtener solo vehículos de escolta activos
      const vehicles = await vehicleService.getVehicles({
        is_escort_vehicle: 1,
        is_active: 1,
        limit: 1000,
      })
      setEscortVehicles(vehicles.items || [])
    } catch (error) {
      console.error('Error cargando vehículos de escolta:', error)
      message.error('Error al cargar vehículos de escolta')
    } finally {
      setLoadingVehicles(false)
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      const formData: AgentFormData = {
        name: values.name,
        document_id: values.document_id,
        mobile: values.mobile,
        vehicle_id: values.vehicle_id,
        is_active: values.is_active ? 1 : 0,
      }

      setLoading(true)

      if (agent) {
        // Actualizar
        await dispatch(updateAgent({ id: agent.id, data: formData })).unwrap()
      } else {
        // Crear
        await dispatch(createAgent(formData)).unwrap()
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
      title={agent ? 'Editar Escolta' : 'Nuevo Escolta'}
      open={visible}
      onOk={handleSubmit}
      onCancel={() => onClose()}
      confirmLoading={loading}
      width={700}
      okText={agent ? 'Actualizar' : 'Crear'}
      cancelText="Cancelar"
    >
      <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Nombre Completo"
              rules={[
                { required: true, message: 'El nombre es requerido' },
                { max: 100, message: 'Máximo 100 caracteres' },
              ]}
            >
              <Input placeholder="Ingrese el nombre completo" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="document_id"
              label="Documento de Identidad"
              rules={[
                { required: true, message: 'El documento es requerido' },
                { max: 20, message: 'Máximo 20 caracteres' },
                {
                  pattern: /^[0-9]+$/,
                  message: 'Solo números',
                },
              ]}
            >
              <Input placeholder="Ingrese el documento" maxLength={20} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="mobile"
              label="Teléfono Móvil"
              rules={[
                { required: true, message: 'El móvil es requerido' },
                { max: 20, message: 'Máximo 20 caracteres' },
              ]}
            >
              <Input placeholder="Ingrese el número móvil" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="vehicle_id"
              label="Vehículo de Escolta Asignado"
              rules={[{ required: true, message: 'El vehículo es requerido' }]}
            >
              <Select
                placeholder="Seleccione un vehículo de escolta"
                showSearch
                loading={loadingVehicles}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                }
              >
                {escortVehicles.map((vehicle) => (
                  <Option key={vehicle.id} value={vehicle.id}>
                    {vehicle.license_plate} - {vehicle.brand} {vehicle.vehicle_type}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {escortVehicles.length === 0 && !loadingVehicles && (
          <div style={{ marginBottom: 16, padding: 10, background: '#fff7e6', border: '1px solid #ffd591', borderRadius: 4 }}>
            <p style={{ margin: 0, color: '#d46b08' }}>
              <strong>Nota:</strong> No hay vehículos de escolta disponibles. 
              Debe crear primero un vehículo y marcarlo como "Vehículo de Escolta".
            </p>
          </div>
        )}

        <Form.Item name="is_active" label="Estado" valuePropName="checked">
          <Switch checkedChildren="Activo" unCheckedChildren="Inactivo" />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default AgentFormModal
