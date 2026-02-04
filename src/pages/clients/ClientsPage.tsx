import React, { useEffect, useState } from 'react'
import { Card, Button, Table, Space, Input, Select, Tag, Modal } from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchClients, deleteClient } from '@/features/clients/clientsSlice'
import type { Client } from '@/types'
import ClientFormModal from './ClientFormModal'
import PageHeader from '@/components/common/PageHeader'

const { Search } = Input
const { Option } = Select

const ClientsPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const { items, loading, pagination } = useAppSelector((state) => state.clients)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<0 | 1 | undefined>(undefined)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = (params = {}) => {
    dispatch(
      fetchClients({
        page: pagination?.current_page || 1,
        limit: pagination?.per_page || 15,
        search,
        is_active: statusFilter,
        ...params,
      })
    )
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    loadClients({ search: value, page: 1 })
  }

  const handleStatusFilterChange = (value: 0 | 1 | undefined) => {
    setStatusFilter(value)
    loadClients({ is_active: value, page: 1 })
  }

  const handleTableChange = (pagination: any) => {
    loadClients({ page: pagination.current, limit: pagination.pageSize })
  }

  const handleAdd = () => {
    setEditingClient(null)
    setModalVisible(true)
  }

  const handleEdit = (client: Client) => {
    setEditingClient(client)
    setModalVisible(true)
  }

  const handleDelete = (client: Client) => {
    Modal.confirm({
      title: '¿Confirmar eliminación?',
      icon: <ExclamationCircleOutlined />,
      content: `¿Está seguro que desea eliminar el cliente "${client.company_name}"?`,
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        await dispatch(deleteClient(client.id_client))
        loadClients()
      },
    })
  }

  const handleModalClose = (refresh?: boolean) => {
    setModalVisible(false)
    setEditingClient(null)
    if (refresh) {
      loadClients()
    }
  }

  const columns: ColumnsType<Client> = [
    {
      title: 'ID',
      dataIndex: 'id_client',
      key: 'id_client',
      width: 80,
    },
    {
      title: 'Razón Social',
      dataIndex: 'company_name',
      key: 'company_name',
      sorter: true,
    },
    {
      title: 'NIT',
      dataIndex: 'tax_id',
      key: 'tax_id',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Teléfono',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Ciudad',
      dataIndex: 'city_id',
      key: 'city_id',
      render: (cityId) => cityId || '-',
    },
    {
      title: 'Estado',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (isActive: 0 | 1) => (
        <Tag color={isActive ? 'green' : 'red'}>{isActive ? 'Activo' : 'Inactivo'}</Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Editar
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            Eliminar
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Gestión de Clientes" />

      <Card>
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <Search
              placeholder="Buscar por razón social, NIT o email"
              allowClear
              style={{ width: 350 }}
              onSearch={handleSearch}
              loading={loading}
              enterButton={<SearchOutlined />}
            />
            <Select
              placeholder="Estado"
              allowClear
              style={{ width: 150 }}
              onChange={handleStatusFilterChange}
              value={statusFilter}
            >
              <Option value={1}>Activos</Option>
              <Option value={0}>Inactivos</Option>
            </Select>
          </Space>

          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Agregar Cliente
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={items}
          loading={loading}
          rowKey="id_client"
          pagination={{
            current: pagination?.current_page || 1,
            pageSize: pagination?.per_page || 15,
            total: pagination?.total || 0,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} clientes`,
          }}
          onChange={handleTableChange}
        />
      </Card>

      <ClientFormModal visible={modalVisible} client={editingClient} onClose={handleModalClose} />
    </div>
  )
}

export default ClientsPage
