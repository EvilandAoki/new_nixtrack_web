import React, { useEffect, useState } from 'react'
import { Tag, Space, Button, Input, Select, message } from 'antd'
import { EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchUsers, deleteUser, clearError } from '@/features/users/usersSlice'
import PageHeader from '@/components/common/PageHeader'
import DataTable from '@/components/common/DataTable'
import FilterPanel from '@/components/common/FilterPanel'
import { showDeleteConfirm } from '@/components/common/DeleteConfirm'
import UserFormModal from './UserFormModal'
import { formatDateTime, formatBoolean } from '@/utils/format'
import { exportToExcel, printTable } from '@/utils/export'
import type { User } from '@/types'
import type { ColumnType } from 'antd/es/table'

const UsersPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const { items, loading, error, pagination } = useAppSelector((state) => state.users)
  
  const [modalVisible, setModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [filters, setFilters] = useState({
    search: '',
    is_active: undefined as 0 | 1 | undefined,
    page: 1,
    limit: 10,
  })

  useEffect(() => {
    dispatch(fetchUsers(filters))
  }, [dispatch, filters])

  useEffect(() => {
    if (error) {
      message.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])

  const handleAdd = () => {
    setEditingUser(null)
    setModalVisible(true)
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setModalVisible(true)
  }

  const handleDelete = (id: number) => {
    showDeleteConfirm({
      title: '¿Está seguro de eliminar este usuario?',
      onConfirm: async () => {
        await dispatch(deleteUser(id))
        message.success('Usuario eliminado exitosamente')
        dispatch(fetchUsers(filters))
      },
    })
  }

  const handleModalClose = (refresh?: boolean) => {
    setModalVisible(false)
    setEditingUser(null)
    if (refresh) {
      dispatch(fetchUsers(filters))
    }
  }

  const handleExport = () => {
    const exportData = items.map((user) => ({
      Nombre: user.name,
      Email: user.email,
      Identificación: user.document_id,
      Teléfono: user.phone,
      Cliente: user.client?.company_name || '-',
      Cargo: user.position,
      Ciudad: user.city_code,
      Rol: user.role?.name || '-',
      Estado: formatBoolean(user.is_active, 'Activo', 'Inactivo'),
      'Creado el': formatDateTime(user.created_at),
    }))
    exportToExcel(exportData, 'usuarios', 'Usuarios')
    message.success('Archivo exportado exitosamente')
  }

  const handlePrint = () => {
    const printData = items.map((user) => ({
      Nombre: user.name,
      Email: user.email,
      Teléfono: user.phone,
      Cliente: user.client?.company_name || '-',
      Rol: user.role?.name || '-',
      Estado: formatBoolean(user.is_active, 'Activo', 'Inactivo'),
    }))
    printTable(printData, 'Listado de Usuarios')
  }

  const columns: ColumnType<User>[] = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Identificación',
      dataIndex: 'document_id',
      key: 'document_id',
    },
    {
      title: 'Teléfono',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Cliente',
      dataIndex: ['client', 'company_name'],
      key: 'client',
    },
    {
      title: 'Rol',
      dataIndex: ['role', 'name'],
      key: 'role',
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Estado',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (value) => (
        <Tag color={value ? 'green' : 'red'}>
          {formatBoolean(value, 'Activo', 'Inactivo')}
        </Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            disabled={!record.is_active}
          >
            Editar
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Eliminar
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Gestión de Usuarios" onAdd={handleAdd} addButtonText="Nuevo Usuario" />

      <FilterPanel
        onClear={() =>
          setFilters({ search: '', is_active: undefined, page: 1, limit: 10 })
        }
      >
        <Space wrap>
          <Input
            placeholder="Buscar por nombre, email o identificación"
            prefix={<SearchOutlined />}
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            style={{ width: 300 }}
            allowClear
          />
          <Select
            placeholder="Estado"
            value={filters.is_active}
            onChange={(value) => setFilters({ ...filters, is_active: value, page: 1 })}
            style={{ width: 150 }}
            allowClear
          >
            <Select.Option value={1}>Activo</Select.Option>
            <Select.Option value={0}>Inactivo</Select.Option>
          </Select>
        </Space>
      </FilterPanel>

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        pagination={{
          current: pagination?.current_page || 1,
          pageSize: pagination?.per_page || 10,
          total: pagination?.total || 0,
          onChange: (newPage, newPageSize) =>
            setFilters({ ...filters, page: newPage, limit: newPageSize }),
        }}
        onExport={handleExport}
        onPrint={handlePrint}
        rowKey="id"
      />

      <UserFormModal
        visible={modalVisible}
        user={editingUser}
        onClose={handleModalClose}
      />
    </div>
  )
}

export default UsersPage
