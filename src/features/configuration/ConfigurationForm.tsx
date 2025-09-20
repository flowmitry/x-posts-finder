import type { Settings } from '../../types'

interface ConfigurationFormProps {
  settings: Settings
  onUpdate: (updates: Partial<Settings>) => void
  onPersist: () => void
}

export function ConfigurationForm({ settings, onUpdate, onPersist }: ConfigurationFormProps) {
  const handlePostLimitChange = (value: string) => {
    const parsedValue = parseInt(value, 10)
    onUpdate({ postLimit: Number.isNaN(parsedValue) ? 0 : parsedValue })
  }

  return (
    <div className="config-section">
      <h2 className="section-title">
        <span>⚙️</span> Configuration
      </h2>

      <div className="form-group form-group-compact">
        <label className="form-label">API Endpoint</label>
        <input
          type="text"
          value={settings.apiUrl}
          onChange={(event) => onUpdate({ apiUrl: event.target.value })}
          onBlur={onPersist}
          className="form-input form-input-compact"
          placeholder="API endpoint URL"
        />
      </div>

      <div className="form-group form-group-compact">
        <label className="form-label">API Key (Optional)</label>
        <div className="input-with-icon">
          <input
            type="password"
            value={settings.apiKey}
            onChange={(event) => onUpdate({ apiKey: event.target.value })}
            onBlur={onPersist}
            className="form-input form-input-compact"
            placeholder="API key (optional)"
          />
          <div className={`input-icon input-icon-compact ${settings.apiKey ? 'valid' : 'invalid'}`}>
            {settings.apiKey ? '🔑' : '🔒'}
          </div>
        </div>
      </div>

      <div className="form-grid">
        <div className="form-group form-group-compact">
          <label className="form-label">Model Name</label>
          <input
            type="text"
            value={settings.modelName}
            onChange={(event) => onUpdate({ modelName: event.target.value })}
            onBlur={onPersist}
            className="form-input form-input-compact"
            placeholder="Model name"
          />
        </div>

        <div className="form-group form-group-compact">
          <label className="form-label">Post Limit</label>
          <input
            type="number"
            value={settings.postLimit}
            onChange={(event) => handlePostLimitChange(event.target.value)}
            onBlur={onPersist}
            className="form-input form-input-compact"
            min="1"
            max="10000"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Post Preferences</label>
        <textarea
          value={settings.preferences}
          onChange={(event) => onUpdate({ preferences: event.target.value })}
          onBlur={onPersist}
          className="form-textarea"
          placeholder="I want to comment on posts about technology, startups, or programming that seem controversial or have interesting discussions..."
        />
        <div className="character-counter">
          {settings.preferences.length}/500 characters
        </div>
      </div>
    </div>
  )
}
