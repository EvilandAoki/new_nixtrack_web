import React, { useEffect } from 'react'
import { Modal, Form, Input, Select, Switch, message } from 'antd'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { createUser, updateUser, fetchRoles } from '@/features/users/usersSlice'
import { fetchClients } from '@/features/clients/clientsSlice'
import { fetchCities } from '@/features/catalog/catalogSlice'
import type { User } from '@/types'

interface UserFormModalProps {
  visible: boolean
  user: User | null
  onClose: (refresh?: boolean) => void
}

const UserFormModal: React.FC<UserFormModalProps> = ({ visible, user, onClose }) => {
  const [form] = Form.useForm()
  const dispatch = useAppDispatch()
  const { loading, roles, rolesLoading } = useAppSelector((state) => state.users)
  const { items: clients, loading: clientsLoading } = useAppSelector((state) => state.clients)
  const { cities, loading: citiesLoading } = useAppSelector((state) => state.catalog)

  useEffect(() => {
    if (visible) {
      dispatch(fetchClients({ limit: 1000, is_active: 1 }))
      dispatch(fetchRoles())
      dispatch(fetchCities())
    }
  }, [dispatch, visible])

  useEffect(() => {
    if (visible && user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        document_id: user.document_id,
        phone: user.phone,
        client_id: user.client_id,
        position: user.position,
        city_code: user.city_code,
        role_id: user.role_id,
        is_active: user.is_active,
      })
    } else {
      form.resetFields()
    }
  }, [visible, user, form])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      if (user) {
        // Update
        await dispatch(updateUser({ id: user.id, userData: values })).unwrap()
        message.success('Usuario actualizado exitosamente')
      } else {
        // Create - need password for new users
        if (!values.password) {
          message.error('La contraseña es requerida para nuevos usuarios')
          return
        }
        await dispatch(createUser(values)).unwrap()
        message.success('Usuario creado exitosamente')
      }

      onClose(true)
    } catch (error: any) {
      if (error.message) {
        message.error(error.message)
      }
    }
  }

  return (
    <Modal
      title={user ? 'Editar Usuario' : 'Nuevo Usuario'}
      open={visible}
      onOk={handleSubmit}
      onCancel={() => onClose()}
      confirmLoading={loading}
      width={600}
      okText="Guardar"
      cancelText="Cancelar"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Nombre Completo"
          rules={[
            { required: true, message: 'El nombre es requerido' },
            { min: 2, message: 'El nombre debe tener al menos 2 caracteres' },
          ]}
        >
          <Input placeholder="Ingrese el nombre completo" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Correo Electrónico"
          rules={[
            { required: true, message: 'El email es requerido' },
            { type: 'email', message: 'Ingrese un email válido' },
          ]}
        >
          <Input placeholder="correo@ejemplo.com" disabled={!!user} />
        </Form.Item>

        <Form.Item
          name="document_id"
          label="Número de Identificación"
          rules={[{ required: true, message: 'La identificación es requerida' }]}
        >
          <Input placeholder="Ingrese el número de identificación" disabled={!!user} />
        </Form.Item>

        {!user && (
          <Form.Item
            name="password"
            label="Contraseña"
            rules={[
              { required: true, message: 'La contraseña es requerida' },
              { min: 6, message: 'La contraseña debe tener al menos 6 caracteres' },
            ]}
          >
            <Input.Password placeholder="Contraseña temporal" />
          </Form.Item>
        )}

        <Form.Item
          name="phone"
          label="Teléfono"
          rules={[{ required: true, message: 'El teléfono es requerido' }]}
        >
          <Input placeholder="Ingrese el teléfono" />
        </Form.Item>

        <Form.Item
          name="client_id"
          label="Cliente"
          rules={[{ required: true, message: 'El cliente es requerido' }]}
        >
          <Select
            placeholder="Seleccione un cliente"
            loading={clientsLoading}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
            }
          >
            {clients.map((client) => (
              <Select.Option key={client.id_client} value={client.id_client}>
                {client.company_name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="position"
          label="Cargo"
          rules={[{ required: true, message: 'El cargo es requerido' }]}
        >
          <Input placeholder="Ej: Supervisor de Operaciones" />
        </Form.Item>

        <Form.Item
          name="city_code"
          label="Ciudad"
          rules={[{ required: true, message: 'La ciudad es requerida' }]}
        >
          <Select
            placeholder="Seleccione una ciudad"
            loading={citiesLoading}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
            }
          >
            {cities.map((city) => (
              <Select.Option key={city.city_id} value={city.code}>
                {city.name} ({city.code})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="role_id"
          label="Rol"
          rules={[{ required: true, message: 'El rol es requerido' }]}
        >
          <Select placeholder="Seleccione un rol" loading={rolesLoading}>
            {roles.map((role) => (
              <Select.Option key={role.id_role} value={role.id_role}>
                {role.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="is_active"
          label="Estado"
          valuePropName="checked"
          initialValue={1}
        >
          <Switch checkedChildren="Activo" unCheckedChildren="Inactivo" />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default UserFormModal
