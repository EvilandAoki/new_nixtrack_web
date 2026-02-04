import { Modal } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'

const { confirm } = Modal

interface DeleteConfirmOptions {
  title?: string
  content?: string
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
}

export const showDeleteConfirm = ({
  title = '¿Está seguro de eliminar este registro?',
  content = 'Esta acción no se puede deshacer.',
  onConfirm,
  onCancel,
}: DeleteConfirmOptions) => {
  confirm({
    title,
    icon: <ExclamationCircleOutlined />,
    content,
    okText: 'Sí, eliminar',
    okType: 'danger',
    cancelText: 'Cancelar',
    onOk: async () => {
      await onConfirm()
    },
    onCancel,
  })
}
