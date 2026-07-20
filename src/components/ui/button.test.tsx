import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Button } from './button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Salvar</Button>)
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument()
  })

  it('applies destructive variant class', () => {
    render(<Button variant="destructive">Excluir</Button>)
    expect(screen.getByRole('button', { name: 'Excluir' })).toHaveClass(
      'bg-destructive',
    )
  })

  it('respects disabled state', () => {
    render(<Button disabled>Desabilitado</Button>)
    expect(screen.getByRole('button', { name: 'Desabilitado' })).toBeDisabled()
  })
})
