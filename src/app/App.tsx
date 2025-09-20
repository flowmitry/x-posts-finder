import { ProcessingProvider } from './providers/ProcessingProvider'
import { SettingsProvider } from './providers/SettingsProvider'
import { Popup } from '../features/popup/Popup'

function App() {
  return (
    <SettingsProvider>
      <ProcessingProvider>
        <Popup />
      </ProcessingProvider>
    </SettingsProvider>
  )
}

export default App
