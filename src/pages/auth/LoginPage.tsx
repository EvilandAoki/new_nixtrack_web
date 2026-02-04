import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Form, Input, Button, Card, Typography, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { loginUser, clearError } from '@/features/auth/authSlice'
import type { LoginRequest } from '@/types'
import './auth.css'

const { Title, Text } = Typography

const LoginPage = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (error) {
      message.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])

  const onFinish = async (values: LoginRequest) => {
    await dispatch(loginUser(values))
  }

  return (
    <div className="auth-container">
      <Card className="auth-card" bordered={false}>
        <div className="auth-header">
          <img src="/logot_orion.png" alt="Orion Logo" className="auth-logo" />
          <Title level={2}>Bienvenido a NixTrack</Title>
          <Text type="secondary">Inicie sesión para continuar al panel de control</Text>
        </div>

        <Form
          name="login"
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
              prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="ejemplo@empresa.com"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            label="Contraseña"
            name="password"
            rules={[{ required: true, message: 'Por favor ingrese su contraseña' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </Form.Item>

          <div style={{ marginBottom: 24, textAlign: 'right' }}>
            <Link to="/recover-password" className="auth-link">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isLoading} block>
              Acceder al Sistema
            </Button>
          </Form.Item>
        </Form>

        <div className="auth-footer">
          <Text type="secondary">© {new Date().getFullYear()} Orion - Todos los derechos reservados</Text>
        </div>
      </Card>
    </div>
  )
}

export default LoginPage
