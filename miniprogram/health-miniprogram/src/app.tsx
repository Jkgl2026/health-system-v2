import { createApp } from '@tarojs/taro'
import './app.scss'

function App(props: { children?: any }) {
  return props.children
}

createApp(App)

export default App
