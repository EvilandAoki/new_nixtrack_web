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
import { fetchAgents, deleteAgent } from '@/features/agents/agentsSlice'
import type { Agent } from '@/types'
import AgentFormModal from './AgentFormModal'
import PageHeader from '@/components/common/PageHeader'

const { Search } = Input
const { Option } = Select

const AgentsPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const { items, loading, pagination } = useAppSelector((state) => state.agents)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<0 | 1 | undefined>(undefined)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)

  useEffect(() => {
    loadAgents()
  }, [])

  const loadAgents = (params = {}) => {
    dispatch(
      fetchAgents({
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
    loadAgents({ search: value, page: 1 })
  }

  const handleStatusFilterChange = (value: 0 | 1 | undefined) => {
    setStatusFilter(value)
    loadAgents({ is_active: value, page: 1 })
  }

  const handleTableChange = (pagination: any) => {
    loadAgents({ page: pagination.current, limit: pagination.pageSize })
  }

  const handleAdd = () => {
    setEditingAgent(null)
    setModalVisible(true)
  }

  const handleEdit = (agent: Agent) => {
    setEditingAgent(agent)
    setModalVisible(true)
  }

  const handleDelete = (agent: Agent) => {
    Modal.confirm({
      title: '¿Confirmar eliminación?',
      icon: <ExclamationCircleOutlined />,
      content: `¿Está seguro que desea eliminar el escolta "${agent.name}"?`,
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        await dispatch(deleteAgent(agent.id))
        loadAgents()
      },
    })
  }

  const handleModalClose = (refresh?: boolean) => {
    setModalVisible(false)
    setEditingAgent(null)
    if (refresh) {
      loadAgents()
    }
  }

  const columns: ColumnsType<Agent> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
    },
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
    },
    {
      title: 'Documento',
      dataIndex: 'document_id',
      key: 'document_id',
    },
    {
      title: 'Móvil',
      dataIndex: 'mobile',
      key: 'mobile',
    },
    {
      title: 'Vehículo Asignado',
      dataIndex: ['vehicle', 'license_plate'],
      key: 'vehicle_plate',
      render: (_, record) => record.vehicle?.license_plate || '-',
    },
    {
      title: 'Marca/Tipo Vehículo',
      key: 'vehicle_info',
      render: (_, record) =>
        record.vehicle
          ? `${record.vehicle.brand} - ${record.vehicle.vehicle_type}`
          : '-',
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
      width: 150,
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
      <PageHeader title="Gestión de Escoltas/Acompañantes" />

      <Card>
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <Search
              placeholder="Buscar por nombre, documento o móvil"
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
            Agregar Escolta
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={items}
          loading={loading}
          rowKey="id"
          pagination={{
            current: pagination?.current_page || 1,
            pageSize: pagination?.per_page || 15,
            total: pagination?.total || 0,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} escoltas`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
        />
      </Card>

      <AgentFormModal visible={modalVisible} agent={editingAgent} onClose={handleModalClose} />
    </div>
  )
}

export default AgentsPage
