import { render, screen } from '@testing-library/react'
import { LoadingSpinner } from '@/components/system/LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders default loading spinner', () => {
    render(<LoadingSpinner />)
    
    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveClass('animate-spin')
  })

  it('renders with custom size', () => {
    render(<LoadingSpinner size="lg" />)
    
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('w-8', 'h-8')
  })

  it('renders with custom color', () => {
    render(<LoadingSpinner color="blue" />)
    
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('text-blue-500')
  })

  it('renders with text', () => {
    const testText = 'Loading data...'
    render(<LoadingSpinner text={testText} />)
    
    expect(screen.getByText(testText)).toBeInTheDocument()
  })

  it('applies custom class name', () => {
    const customClass = 'custom-spinner-class'
    render(<LoadingSpinner className={customClass} />)
    
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass(customClass)
  })

  it('provides aria-label for accessibility', () => {
    render(<LoadingSpinner />)
    
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveAttribute('aria-label', 'Loading')
  })

  it('supports multiple size options', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />)
    expect(screen.getByRole('status')).toHaveClass('w-4', 'h-4')
    
    rerender(<LoadingSpinner size="md" />)
    expect(screen.getByRole('status')).toHaveClass('w-6', 'h-6')
    
    rerender(<LoadingSpinner size="lg" />)
    expect(screen.getByRole('status')).toHaveClass('w-8', 'h-8')
    
    rerender(<LoadingSpinner size="xl" />)
    expect(screen.getByRole('status')).toHaveClass('w-12', 'h-12')
  })

  it('supports multiple color options', () => {
    const { rerender } = render(<LoadingSpinner color="primary" />)
    expect(screen.getByRole('status')).toHaveClass('text-[#A8E6CF]')
    
    rerender(<LoadingSpinner color="secondary" />)
    expect(screen.getByRole('status')).toHaveClass('text-[#FFD3B6]')
    
    rerender(<LoadingSpinner color="accent" />)
    expect(screen.getByRole('status')).toHaveClass('text-[#E0BBE4]')
  })
})
