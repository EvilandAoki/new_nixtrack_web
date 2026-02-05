import React, { useEffect, useState } from 'react'
import { Card, Tabs, Descriptions, Tag, Button, Space, Spin, Image, Upload, message, Modal, Table } from 'antd'
import {
  ArrowLeftOutlined,
  EditOutlined,
  UploadOutlined,
  DeleteOutlined,
  StarOutlined,
  StarFilled,
  EyeOutlined,
} from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchVehicleById } from '@/features/vehicles/vehiclesSlice'
import { fileService } from '@/api/services/file.service'
import { vehicleService } from '@/api/services/vehicle.service'
import PageHeader from '@/components/common/PageHeader'
import dayjs from 'dayjs'
import ImageUploadModal from '@/components/vehicles/ImageUploadModal'
import { getFileUrl } from '@/utils/url'

// Remove deprecated TabPane import

const VehicleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { selected: vehicle, loading } = useAppSelector((state) => state.vehicles)
  const [history, setHistory] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [isPhotoModalVisible, setIsPhotoModalVisible] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()

  useEffect(() => {
    if (id) {
      const vid = Number(id)
      dispatch(fetchVehicleById(vid))
      loadHistory(vid)
    }
  }, [id, dispatch])

  const loadHistory = async (vid: number) => {
    try {
      setLoadingHistory(true)
      const data = await vehicleService.getVehicleHistory(vid)
      setHistory(data)
    } catch (error) {
      console.error('Error cargando historial:', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  const refreshData = () => {
    if (id) {
      dispatch(fetchVehicleById(Number(id)))
    }
  }

  const handleUpload = async (file: File, description: string = '', isMainPhoto: boolean = false) => {
    if (!id) return

    try {
      setUploadingFile(true)
      await fileService.uploadVehicleFile(Number(id), file, description, isMainPhoto)
      messageApi.success('Archivo subido exitosamente')
      setIsPhotoModalVisible(false)
      refreshData()
    } catch (error: any) {
      messageApi.error(error.response?.data?.message || 'Error al subir archivo')
    } finally {
      setUploadingFile(false)
    }
  }

  const handleDeleteFile = (fileId: number) => {
    Modal.confirm({
      title: '¿Eliminar archivo?',
      content: '¿Está seguro que desea eliminar este archivo?',
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await fileService.deleteVehicleFile(Number(id), fileId)
          message.success('Archivo eliminado')
          refreshData()
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Error al eliminar archivo')
        }
      },
    })
  }

  const handleSetMainPhoto = async (fileId: number) => {
    if (!id) return
    try {
      await fileService.setMainVehiclePhoto(Number(id), fileId)
      messageApi.success('Foto principal actualizada')
      refreshData()
    } catch (error: any) {
      messageApi.error(error.response?.data?.message || 'Error al actualizar foto principal')
    }
  }

  if (loading || !vehicle) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    )
  }

  const files = vehicle.files || []
  const mainPhoto = files.find((f) => f.is_main_photo === 1)
  const otherPhotos = files.filter((f) => f.is_main_photo === 0)

  const historyColumns = [
    {
      title: 'Orden #',
      dataIndex: 'order_number',
      key: 'order_number',
      render: (text: string, record: any) => (
        <Button
          type="link"
          onClick={() => navigate(`/orders/${record.id}`)}
          style={{ padding: 0 }}
        >
          {text}
        </Button>
      )
    },
    {
      title: 'Fecha',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Origen',
      dataIndex: 'origin_city_code',
      key: 'origin_city_code',
    },
    {
      title: 'Destino',
      dataIndex: 'destination_city_code',
      key: 'destination_city_code',
    },
    {
      title: 'Estado',
      dataIndex: 'status_name',
      key: 'status_name',
      render: (name: string) => <Tag>{name}</Tag>
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: any) => (
        <Button
          icon={<EyeOutlined />}
          size="small"
          onClick={() => navigate(`/orders/${record.id}`)}
        >
          Ver Orden
        </Button>
      )
    }
  ]

  return (
    <div>
      {contextHolder}
      <PageHeader
        title={`Vehículo: ${vehicle.license_plate}`}
        extra={
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/vehicles')}>
              Volver
            </Button>
            <Button type="primary" icon={<EditOutlined />}>
              Editar
            </Button>
          </Space>
        }
      />

      <Card>
        <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: '1',
              label: 'Información General',
              children: (
                <>
                  <Descriptions bordered column={2}>
                    <Descriptions.Item label="ID">{vehicle.id}</Descriptions.Item>
                    <Descriptions.Item label="Placa">{vehicle.license_plate}</Descriptions.Item>
                    <Descriptions.Item label="Marca">{vehicle.brand}</Descriptions.Item>
                    <Descriptions.Item label="Tipo">{vehicle.vehicle_type}</Descriptions.Item>
                    <Descriptions.Item label="Año">{vehicle.model_year}</Descriptions.Item>
                    <Descriptions.Item label="Color">{vehicle.color}</Descriptions.Item>
                    <Descriptions.Item label="Capacidad">{vehicle.capacity || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Contenedor">{vehicle.container || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Cliente" span={2}>
                      {vehicle.client?.company_name || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Números de Serie" span={2}>
                      {vehicle.serial_numbers || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Tipo de Vehículo">
                      <Tag color={vehicle.is_escort_vehicle ? 'blue' : 'default'}>
                        {vehicle.is_escort_vehicle ? 'Escolta' : 'Normal'}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Estado">
                      <Tag color={vehicle.is_active ? 'green' : 'red'}>
                        {vehicle.is_active ? 'Activo' : 'Inactivo'}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Fecha de Creación">
                      {dayjs(vehicle.created_at).format('DD/MM/YYYY HH:mm')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Última Actualización">
                      {vehicle.updated_at ? dayjs(vehicle.updated_at).format('DD/MM/YYYY HH:mm') : '-'}
                    </Descriptions.Item>
                  </Descriptions>

                  <div style={{ marginTop: 24 }}>
                    <h3>Galería de Fotos</h3>
                    {mainPhoto && (
                      <div style={{ marginBottom: 16 }}>
                        <p>
                          <strong>Foto Principal:</strong>
                        </p>
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                          <Image
                            width={300}
                            src={getFileUrl(mainPhoto.file_url)}
                            alt={mainPhoto.description}
                            style={{ objectFit: 'cover' }}
                          />
                          <StarFilled
                            style={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              color: '#ffd700',
                              fontSize: 24,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {otherPhotos.length > 0 && (
                      <div>
                        <p>
                          <strong>Otras Fotos:</strong>
                        </p>
                        <Image.PreviewGroup>
                          <Space wrap>
                            {otherPhotos.map((file) => (
                              <div key={file.id} style={{ position: 'relative' }}>
                                <Image
                                  width={150}
                                  height={150}
                                  src={getFileUrl(file.file_url)}
                                  alt={file.description}
                                  style={{ objectFit: 'cover' }}
                                />
                                <div
                                  style={{
                                    position: 'absolute',
                                    top: 4,
                                    right: 4,
                                    display: 'flex',
                                    gap: 4,
                                  }}
                                >
                                  <Button
                                    type="primary"
                                    size="small"
                                    icon={<StarOutlined />}
                                    onClick={() => handleSetMainPhoto(file.id)}
                                  />
                                  <Button
                                    danger
                                    size="small"
                                    icon={<DeleteOutlined />}
                                    onClick={() => handleDeleteFile(file.id)}
                                  />
                                </div>
                              </div>
                            ))}
                          </Space>
                        </Image.PreviewGroup>
                      </div>
                    )}

                    <Button
                      icon={<UploadOutlined />}
                      onClick={() => setIsPhotoModalVisible(true)}
                      style={{ marginTop: 16 }}
                    >
                      Subir Foto
                    </Button>

                    <ImageUploadModal
                      visible={isPhotoModalVisible}
                      onCancel={() => setIsPhotoModalVisible(false)}
                      onUpload={handleUpload}
                      loading={uploadingFile}
                    />
                  </div>
                </>
              ),
            },
            {
              key: '2',
              label: 'Historial de Servicios',
              children: (
                <Table
                  columns={historyColumns}
                  dataSource={history}
                  rowKey="id"
                  loading={loadingHistory}
                  pagination={{ pageSize: 10 }}
                />
              ),
            },
            {
              key: '3',
              label: 'Archivos y Documentos',
              children: (
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Upload
                    beforeUpload={handleUpload as any}
                    showUploadList={false}
                    disabled={uploadingFile}
                  >
                    <Button icon={<UploadOutlined />} loading={uploadingFile}>
                      Subir Documento
                    </Button>
                  </Upload>

                  {loading ? (
                    <Spin />
                  ) : (
                    <div>
                      {files.length === 0 ? (
                        <p>No hay archivos disponibles</p>
                      ) : (
                        <Space direction="vertical" style={{ width: '100%' }}>
                          {files.map((file) => (
                            <Card
                              key={file.id}
                              size="small"
                              extra={
                                <Button
                                  danger
                                  size="small"
                                  icon={<DeleteOutlined />}
                                  onClick={() => handleDeleteFile(file.id)}
                                >
                                  Eliminar
                                </Button>
                              }
                            >
                              <p>
                                <strong>{file.file_name}</strong>
                              </p>
                              {file.description && <p>{file.description}</p>}
                              <p>
                                <small>
                                  {dayjs(file.created_at).format('DD/MM/YYYY HH:mm')}
                                </small>
                              </p>
                              <a href={getFileUrl(file.file_url)} target="_blank" rel="noopener noreferrer">
                                Ver archivo
                              </a>
                            </Card>
                          ))}
                        </Space>
                      )}
                    </div>
                  )}
                </Space>
              ),
            },
          ]}
        />
      </Card>
    </div>
  )
}

export default VehicleDetailPage
