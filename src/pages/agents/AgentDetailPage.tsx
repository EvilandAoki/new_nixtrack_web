import React, { useEffect, useState } from 'react'
import { Card, Tabs, Descriptions, Tag, Button, Space, Spin, Image, Upload, message, Modal } from 'antd'
import {
  ArrowLeftOutlined,
  EditOutlined,
  UploadOutlined,
  DeleteOutlined,
  StarOutlined,
  StarFilled,
} from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchAgentById } from '@/features/agents/agentsSlice'
import { fileService } from '@/api/services/file.service'
import PageHeader from '@/components/common/PageHeader'
import dayjs from 'dayjs'
import ImageUploadModal from '@/components/vehicles/ImageUploadModal'
import { getFileUrl } from '@/utils/url'

const AgentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { selected: agent, loading } = useAppSelector((state) => state.agents)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [isPhotoModalVisible, setIsPhotoModalVisible] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()

  useEffect(() => {
    if (id) {
      dispatch(fetchAgentById(Number(id)))
    }
  }, [id, dispatch])

  const refreshData = () => {
    if (id) {
      dispatch(fetchAgentById(Number(id)))
    }
  }

  /**
   * Handle file upload
   */
  const handleUpload = async (file: File, description: string = '', isMainPhoto: boolean = false) => {
    if (!id) return

    try {
      setUploadingFile(true)
      await fileService.uploadAgentFile(Number(id), file, description, isMainPhoto)
      messageApi.success('Archivo subido exitosamente')
      setIsPhotoModalVisible(false)
      refreshData()
    } catch (error: any) {
      messageApi.error(error.response?.data?.message || 'Error al subir archivo')
    } finally {
      setUploadingFile(false)
    }
  }

  /**
   * Handle file deletion
   */
  const handleDeleteFile = (fileId: number) => {
    Modal.confirm({
      title: '¿Eliminar archivo?',
      content: '¿Está seguro que desea eliminar este archivo?',
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await fileService.deleteAgentFile(Number(id), fileId)
          message.success('Archivo eliminado')
          refreshData()
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Error al eliminar archivo')
        }
      },
    })
  }

  /**
   * Handle setting main photo
   */
  const handleSetMainPhoto = async (fileId: number) => {
    if (!id) return
    try {
      await fileService.setMainAgentPhoto(Number(id), fileId)
      messageApi.success('Foto principal actualizada')
      refreshData()
    } catch (error: any) {
      messageApi.error(error.response?.data?.message || 'Error al actualizar foto principal')
    }
  }

  if (loading || !agent) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    )
  }

  const files = agent.files || []
  const imageFiles = files.filter((f) => f.mime_type?.startsWith('image/'))
  const mainPhoto = imageFiles.find((f) => f.is_main_photo === 1)
  const otherPhotos = imageFiles.filter((f) => f.is_main_photo === 0)

  return (
    <div>
      {contextHolder}
      <PageHeader
        title={`Escolta: ${agent.name}`}
        extra={
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/agents')}>
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
                    <Descriptions.Item label="ID">{agent.id}</Descriptions.Item>
                    <Descriptions.Item label="Nombre">{agent.name}</Descriptions.Item>
                    <Descriptions.Item label="Documento">{agent.document_id}</Descriptions.Item>
                    <Descriptions.Item label="Móvil">{agent.mobile}</Descriptions.Item>
                    <Descriptions.Item label="Vehículo Asignado" span={2}>
                      {agent.vehicle ? (
                        <span>
                          {agent.vehicle.license_plate} - {agent.vehicle.brand} {agent.vehicle.vehicle_type}
                          <Button
                            type="link"
                            size="small"
                            onClick={() => navigate(`/vehicles/${agent.vehicle_id}`)}
                          >
                            Ver detalles
                          </Button>
                        </span>
                      ) : (
                        '-'
                      )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Estado">
                      <Tag color={agent.is_active ? 'green' : 'red'}>
                        {agent.is_active ? 'Activo' : 'Inactivo'}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Fecha de Creación">
                      {dayjs(agent.created_at).format('DD/MM/YYYY HH:mm')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Última Actualización" span={2}>
                      {agent.updated_at ? dayjs(agent.updated_at).format('DD/MM/YYYY HH:mm') : '-'}
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
              label: 'Archivos y Documentos',
              children: (
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Upload
                    beforeUpload={(file) => {
                      handleUpload(file, '', false)
                      return false
                    }}
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

export default AgentDetailPage
