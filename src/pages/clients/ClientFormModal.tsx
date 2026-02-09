import React, { useEffect, useState } from 'react'
import { Modal, Form, Input, Select, Switch, Row, Col, message } from 'antd'
import { useAppDispatch } from '@/store/hooks'
import { createClient, updateClient } from '@/features/clients/clientsSlice'
import { catalogService } from '@/api/services/catalog.service'
import type { Client, ClientFormData, Department, City } from '@/types'

const { Option } = Select

interface ClientFormModalProps {
  visible: boolean
  client: Client | null
  onClose: (refresh?: boolean) => void
}

const ClientFormModal: React.FC<ClientFormModalProps> = ({ visible, client, onClose }) => {
  const [form] = Form.useForm()
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(false)

  const [countries] = useState([{ code: 'CO', name: 'Colombia' }])
  const [departments, setDepartments] = useState<Department[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [selectedCountry, setSelectedCountry] = useState<string>('CO')
  const [selectedDepartment, setSelectedDepartment] = useState<string | undefined>()

  useEffect(() => {
    if (visible) {
      if (client) {
        // Modo edición
        form.setFieldsValue({
          company_name: client.company_name,
          tax_id: client.tax_id,
          phone: client.phone,
          address: client.address,
          email: client.email,
          country_id: client.country_id,
          city_id: client.city_id,
          is_active: client.is_active === 1,
        })
        console.log('Cliente a editar:', client)
        setSelectedCountry(client.country_id)
        loadDepartments(client.country_id)
        // Cargar información de la ciudad para obtener el departamento
        loadClientCityInfo(client.city_id)
      } else {
        // Modo creación
        form.resetFields()
        form.setFieldsValue({
          country_id: 'CO',
          is_active: true,
        })
        setSelectedCountry('CO')
        loadDepartments('CO')
      }
    }
  }, [visible, client, form])

  const loadDepartments = async (countryCode: string) => {
    try {
      const deps = await catalogService.getDepartments(countryCode)
      setDepartments(deps || [])
    } catch (error: any) {
      console.error('Error cargando departamentos:', error)
      setDepartments([])
      message.error(error.response?.data?.message || 'Error al cargar departamentos')
    }
  }

  const loadCities = async (departmentCode: string) => {
    try {
      console.log('Cargando ciudades para departamento:', departmentCode)
      const citiesList = await catalogService.getCities({ department_code: departmentCode })
      console.log('Ciudades cargadas:', citiesList)
      setCities(citiesList || [])
    } catch (error: any) {
      console.error('Error cargando ciudades:', error)
      setCities([])
      message.error(error.response?.data?.message || 'Error al cargar ciudades')
    }
  }

  const loadClientCityInfo = async (cityId: number) => {
    try {
      const city = await catalogService.getCityById(cityId)
      if (city && city.department_code) {
        setSelectedDepartment(city.department_code)
        form.setFieldsValue({ department_code: city.department_code })
        loadCities(city.department_code)
      }
    } catch (error: any) {
      console.error('Error cargando información de la ciudad:', error)
      message.error(error.response?.data?.message || 'Error al cargar información de la ciudad')
    }
  }

  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode)
    setSelectedDepartment(undefined)
    setCities([])
    form.setFieldsValue({ department_code: undefined, city_id: undefined })
    loadDepartments(countryCode)
  }

  const handleDepartmentChange = (departmentCode: string) => {
    setSelectedDepartment(departmentCode)
    form.setFieldsValue({ city_id: undefined })
    loadCities(departmentCode)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      const formData: ClientFormData = {
        company_name: values.company_name,
        tax_id: values.tax_id,
        phone: values.phone,
        address: values.address,
        email: values.email,
        country_id: values.country_id,
        city_id: values.city_id,
        is_active: values.is_active ? 1 : 0,
      }

      setLoading(true)

      if (client) {
        // Actualizar
        await dispatch(updateClient({ id: client.id_client, data: formData })).unwrap()
      } else {
        // Crear
        await dispatch(createClient(formData)).unwrap()
      }

      onClose(true) // Cerrar y refrescar
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
      title={client ? 'Editar Cliente' : 'Nuevo Cliente'}
      open={visible}
      onOk={handleSubmit}
      onCancel={() => onClose()}
      confirmLoading={loading}
      width={700}
      okText={client ? 'Actualizar' : 'Crear'}
      cancelText="Cancelar"
    >
      <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="company_name"
              label="Razón Social"
              rules={[
                { required: true, message: 'La razón social es requerida' },
                { max: 200, message: 'Máximo 200 caracteres' },
              ]}
            >
              <Input placeholder="Ingrese la razón social" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="tax_id"
              label="NIT"
              rules={[
                { required: true, message: 'El NIT es requerido' },
                { max: 20, message: 'Máximo 20 caracteres' },
              ]}
            >
              <Input placeholder="Ingrese el NIT" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'El email es requerido' },
                { type: 'email', message: 'Email inválido' },
                { max: 100, message: 'Máximo 100 caracteres' },
              ]}
            >
              <Input placeholder="correo@ejemplo.com" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="phone"
              label="Teléfono"
              rules={[
                { required: true, message: 'El teléfono es requerido' },
                { max: 20, message: 'Máximo 20 caracteres' },
              ]}
            >
              <Input placeholder="Ingrese el teléfono" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="address"
          label="Dirección"
          rules={[
            { required: true, message: 'La dirección es requerida' },
            { max: 255, message: 'Máximo 255 caracteres' },
          ]}
        >
          <Input.TextArea rows={2} placeholder="Ingrese la dirección" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="country_id"
              label="País"
              rules={[{ required: true, message: 'El país es requerido' }]}
            >
              <Select placeholder="Seleccione un país" onChange={handleCountryChange}>
                {countries.map((country) => (
                  <Option key={country.code} value={country.code}>
                    {country.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item name="department_code" label="Departamento">
              <Select
                placeholder="Seleccione departamento"
                allowClear
                onChange={handleDepartmentChange}
                disabled={!selectedCountry}
              >
                {departments.map((dept) => (
                  <Option key={dept.code} value={dept.code}>
                    {dept.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="city_id"
              label="Ciudad"
              rules={[{ required: true, message: 'La ciudad es requerida' }]}
            >
              <Select
                placeholder="Seleccione ciudad"
                showSearch
                optionFilterProp="children"
                disabled={!selectedDepartment}
              >
                {(cities || []).map((city) => (
                  <Option key={city.city_id} value={city.city_id}>
                    {city.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="is_active" label="Estado" valuePropName="checked">
          <Switch checkedChildren="Activo" unCheckedChildren="Inactivo" />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default ClientFormModal
