import React, { useEffect, useState } from 'react'
import { Card, Button, Table, Space, Input, Select, Tag, Modal } from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchVehicles, deleteVehicle } from '@/features/vehicles/vehiclesSlice'
import type { Vehicle } from '@/types'
import VehicleFormModal from './VehicleFormModal'
import PageHeader from '@/components/common/PageHeader'
import { useNavigate } from 'react-router-dom'

const { Search } = Input
const { Option } = Select

const VehiclesPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { items, loading, pagination } = useAppSelector((state) => state.vehicles)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<0 | 1 | undefined>(undefined)
  const [escortFilter, setEscortFilter] = useState<0 | 1 | undefined>(undefined)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)

  useEffect(() => {
    loadVehicles()
  }, [])

  const loadVehicles = (params = {}) => {
    dispatch(
      fetchVehicles({
        page: pagination?.current_page || 1,
        limit: pagination?.per_page || 15,
        search,
        is_active: statusFilter,
        is_escort_vehicle: escortFilter,
        ...params,
      })
    )
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    loadVehicles({ search: value, page: 1 })
  }

  const handleStatusFilterChange = (value: 0 | 1 | undefined) => {
    setStatusFilter(value)
    loadVehicles({ is_active: value, page: 1 })
  }

  const handleEscortFilterChange = (value: 0 | 1 | undefined) => {
    setEscortFilter(value)
    loadVehicles({ is_escort_vehicle: value, page: 1 })
  }

  const handleTableChange = (pagination: any) => {
    loadVehicles({ page: pagination.current, limit: pagination.pageSize })
  }

  const handleAdd = () => {
    setEditingVehicle(null)
    setModalVisible(true)
  }

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle)
    setModalVisible(true)
  }

  const handleView = (vehicle: Vehicle) => {
    navigate(`/vehicles/${vehicle.id}`)
  }

  const handleDelete = (vehicle: Vehicle) => {
    Modal.confirm({
      title: '¿Confirmar eliminación?',
      icon: <ExclamationCircleOutlined />,
      content: `¿Está seguro que desea eliminar el vehículo con placa "${vehicle.license_plate}"?`,
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        await dispatch(deleteVehicle(vehicle.id))
        loadVehicles()
      },
    })
  }

  const handleModalClose = (refresh?: boolean) => {
    setModalVisible(false)
    setEditingVehicle(null)
    if (refresh) {
      loadVehicles()
    }
  }

  const columns: ColumnsType<Vehicle> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
    },
    {
      title: 'Placa',
      dataIndex: 'license_plate',
      key: 'license_plate',
      sorter: true,
    },
    {
      title: 'Marca',
      dataIndex: 'brand',
      key: 'brand',
    },
    {
      title: 'Tipo',
      dataIndex: 'vehicle_type',
      key: 'vehicle_type',
    },
    {
      title: 'Modelo',
      dataIndex: 'model_year',
      key: 'model_year',
      width: 100,
    },
    {
      title: 'Color',
      dataIndex: 'color',
      key: 'color',
    },
    {
      title: 'Cliente',
      dataIndex: ['client', 'company_name'],
      key: 'client_name',
      render: (_, record) => record.client?.company_name || '-',
    },
    {
      title: 'Tipo Vehículo',
      dataIndex: 'is_escort_vehicle',
      key: 'is_escort_vehicle',
      width: 120,
      render: (isEscort: 0 | 1) => (
        <Tag color={isEscort ? 'blue' : 'default'}>{isEscort ? 'Escolta' : 'Normal'}</Tag>
      ),
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
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            Ver
          </Button>
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
      <PageHeader title="Gestión de Vehículos" />

      <Card>
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <Space wrap>
            <Search
              placeholder="Buscar por placa, marca o tipo"
              allowClear
              style={{ width: 300 }}
              onSearch={handleSearch}
              loading={loading}
              enterButton={<SearchOutlined />}
            />
            <Select
              placeholder="Estado"
              allowClear
              style={{ width: 130 }}
              onChange={handleStatusFilterChange}
              value={statusFilter}
            >
              <Option value={1}>Activos</Option>
              <Option value={0}>Inactivos</Option>
            </Select>
            <Select
              placeholder="Tipo"
              allowClear
              style={{ width: 150 }}
              onChange={handleEscortFilterChange}
              value={escortFilter}
            >
              <Option value={1}>Escolta</Option>
              <Option value={0}>Normal</Option>
            </Select>
          </Space>

          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Agregar Vehículo
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
            showTotal: (total) => `Total ${total} vehículos`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>

      <VehicleFormModal
        visible={modalVisible}
        vehicle={editingVehicle}
        onClose={handleModalClose}
      />
    </div>
  )
}

export default VehiclesPage
