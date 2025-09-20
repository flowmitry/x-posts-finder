import type { ButtonHTMLAttributes } from 'react'

type ActionButtonVariant = 'default' | 'start' | 'stop'

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ActionButtonVariant
}

export function ActionButton({ variant = 'default', className = '', children, type = 'button', ...props }: ActionButtonProps) {
  const classes = ['action-button']

  if (variant !== 'default') {
    classes.push(variant)
  }

  if (className) {
    classes.push(className)
  }

  return (
    <button className={classes.join(' ')} type={type} {...props}>
      {children}
    </button>
  )
}
