import React, { useEffect, useState } from 'react'
import { Modal, Form, Input, Select, Upload, Button, message, Space } from 'antd'
import { UploadOutlined, EnvironmentOutlined } from '@ant-design/icons'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { createOrderDetail } from '@/features/orders/orderDetailsSlice'
import dayjs from 'dayjs'

const { TextArea } = Input
const { Option } = Select

interface OrderDetailFormModalProps {
  visible: boolean
  orderId: number
  onClose: (refresh?: boolean) => void
}

const OrderDetailFormModal: React.FC<OrderDetailFormModalProps> = ({
  visible,
  orderId,
  onClose,
}) => {
  const [form] = Form.useForm()
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(false)
  const [capturingLocation, setCapturingLocation] = useState(false)
  const [files, setFiles] = useState<File[]>([])

  const { user } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (visible) {
      form.resetFields()
      form.setFieldsValue({
        reported_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        reported_by: user?.name || '',
        sequence_number: 1, // Sin novedad por defecto
      })
      setFiles([])
    }
  }, [visible, form, user])

  const handleCaptureLocation = () => {
    if (!navigator.geolocation) {
      message.error('La geolocalización no está disponible en este navegador')
      return
    }

    setCapturingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        form.setFieldsValue({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        message.success('Ubicación capturada exitosamente')
        setCapturingLocation(false)
      },
      (error) => {
        console.error('Error capturando ubicación:', error)
        message.error('Error al capturar ubicación. Verifique los permisos.')
        setCapturingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      const formData: any = {
        shipment_id: orderId,
        reported_at: dayjs(values.reported_at).format('YYYY-MM-DD HH:mm:ss'),
        reported_by: values.reported_by,
        location_name: values.location_name,
        sequence_number: values.sequence_number,
        notes: values.notes || null,
      }

      // Only add coordinates if they are valid numbers
      if (values.latitude !== undefined && values.latitude !== null && values.latitude !== '') {
        formData.latitude = Number(values.latitude)
      }

      if (values.longitude !== undefined && values.longitude !== null && values.longitude !== '') {
        formData.longitude = Number(values.longitude)
      }

      setLoading(true)

      await dispatch(createOrderDetail({ data: formData, files })).unwrap()

      onClose(true)
    } catch (error: any) {
      if (error.errorFields) {
        message.error('Por favor complete todos los campos requeridos')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (info: any) => {
    const fileList = info.fileList.map((file: any) => file.originFileObj).filter(Boolean)
    setFiles(fileList)
  }

  return (
    <Modal
      title="Crear Reporte"
      open={visible}
      onOk={handleSubmit}
      onCancel={() => onClose()}
      confirmLoading={loading}
      width={700}
      okText="Crear Reporte"
      cancelText="Cancelar"
    >
      <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
        <Form.Item name="reported_at" label="Fecha y Hora" hidden>
          <Input disabled />
        </Form.Item>

        <Form.Item name="reported_by" label="Reportado por" hidden>
          <Input disabled />
        </Form.Item>

        <Form.Item
          name="location_name"
          label="Punto de Reporte"
          rules={[
            { required: true, message: 'El punto de reporte es requerido' },
            { max: 255, message: 'Máximo 255 caracteres' },
          ]}
        >
          <Input placeholder="Ej: Km 45 Autopista Norte, Entrada Peaje, etc." />
        </Form.Item>

        <Form.Item
          name="sequence_number"
          label="Tipo de Reporte"
          rules={[{ required: true, message: 'El tipo es requerido' }]}
        >
          <Select>
            <Option value={1}>Sin Novedad</Option>
            <Option value={0}>Con Novedad</Option>
          </Select>
        </Form.Item>

        <Form.Item name="notes" label="Observaciones">
          <TextArea rows={4} placeholder="Describa cualquier observación relevante" />
        </Form.Item>

        <Form.Item label="Ubicación GPS (Opcional)">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button
              icon={<EnvironmentOutlined />}
              onClick={handleCaptureLocation}
              loading={capturingLocation}
            >
              Capturar Ubicación Actual
            </Button>

            <div style={{ display: 'flex', gap: 10 }}>
              <Form.Item name="latitude" style={{ flex: 1, marginBottom: 0 }}>
                <Input placeholder="Latitud" allowClear />
              </Form.Item>
              <Form.Item name="longitude" style={{ flex: 1, marginBottom: 0 }}>
                <Input placeholder="Longitud" allowClear />
              </Form.Item>
            </div>
            <div style={{ fontSize: '11px', color: '#888' }}>
              Puede capturar la ubicación automáticamente o ingresarla manualmente.
            </div>
          </Space>
        </Form.Item>

        <Form.Item label="Archivos Adjuntos">
          <Upload
            multiple
            accept="image/*,.pdf"
            beforeUpload={() => false}
            onChange={handleFileChange}
            listType="picture"
          >
            <Button icon={<UploadOutlined />}>Seleccionar Archivos</Button>
          </Upload>
          <div style={{ marginTop: 8, color: '#666', fontSize: 12 }}>
            Puede adjuntar fotos o documentos (máximo 10MB por archivo)
          </div>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default OrderDetailFormModal
