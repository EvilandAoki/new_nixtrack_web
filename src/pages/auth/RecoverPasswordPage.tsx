import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Form, Input, Button, Card, Typography, message, Result } from 'antd'
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import './auth.css'

const { Title, Text } = Typography

const RecoverPasswordPage = () => {
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const onFinish = async (_values: { email: string }) => {
    setLoading(true)
    try {
      // TODO: Implement password recovery API call
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setEmailSent(true)
      message.success('Correo de recuperación enviado exitosamente')
    } catch (error) {
      message.error('Error al enviar el correo de recuperación')
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="auth-container">
        <Card className="auth-card" bordered={false}>
          <Result
            status="success"
            title="Correo Enviado"
            subTitle="Hemos enviado un enlace de recuperación a tu correo electrónico. Por favor revisa tu bandeja de entrada."
            extra={[
              <Link to="/login" key="back">
                <Button type="primary" block>Volver al Inicio de Sesión</Button>
              </Link>,
            ]}
          />
        </Card>
      </div>
    )
  }

  return (
    <div className="auth-container">
      <Card className="auth-card" bordered={false}>
        <div className="auth-header">
          <img src="/logot_orion.png" alt="Orion Logo" className="auth-logo" />
          <Title level={2}>Recuperar Contraseña</Title>
          <Text type="secondary">
            Ingresa tu correo y te enviaremos las instrucciones de recuperación
          </Text>
        </div>

        <Form
          name="recover"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            label="Correo Electrónico"
            name="email"
            rules={[
              { required: true, message: 'Por favor ingrese su correo electrónico' },
              { type: 'email', message: 'Por favor ingrese un correo válido' },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="ejemplo@empresa.com"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Enviar Instrucciones
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Link to="/login" className="auth-link">
              <ArrowLeftOutlined /> Volver al Login
            </Link>
          </div>
        </Form>

        <div className="auth-footer">
          <Text type="secondary">© {new Date().getFullYear()} Orion - Soporte IT</Text>
        </div>
      </Card>
    </div>
  )
}

export default RecoverPasswordPage
