interface HeaderProps {
  isProcessing: boolean
}

export function Header({ isProcessing }: HeaderProps) {
  return (
    <header className="x-posts-finder-header">
      <div className="header-content">
        <div className="header-main">
          <div className={`header-icon ${isProcessing ? 'processing' : ''}`}>
            <span>XPF</span>
          </div>

          <div className="header-text">
            <h1 className="header-title">XPostsFinder</h1>
            <p className="header-subtitle">Discover conversations worth joining</p>
          </div>
        </div>
      </div>
    </header>
  )
}
