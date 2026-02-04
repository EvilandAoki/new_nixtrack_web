import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { ConfigProvider } from 'antd'
import esES from 'antd/locale/es_ES'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import App from './App'
import { store } from './store'
import './assets/styles/global.css'
import './utils/checkEnv'

dayjs.locale('es')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ConfigProvider locale={esES}>
        <App />
      </ConfigProvider>
    </Provider>
  </React.StrictMode>,
)
