import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorMessage } from '@/components/system/ErrorMessage'

describe('ErrorMessage', () => {
  const mockError = 'This is a test error message.'
  const mockOnRetry = jest.fn()
  const mockOnClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders error message', () => {
    render(<ErrorMessage error={mockError} />)
    
    expect(screen.getByText(mockError)).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('displays error icon', () => {
    render(<ErrorMessage error={mockError} />)
    
    const icon = screen.getByTestId('error-icon')
    expect(icon).toBeInTheDocument()
    expect(icon).toHaveClass('ri-error-warning-line')
  })

  it('calls onRetry when retry button is provided', () => {
    render(<ErrorMessage error={mockError} onRetry={mockOnRetry} />)
    
    const retryButton = screen.getByRole('button', { name: /Retry/i })
    expect(retryButton).toBeInTheDocument()
    
    fireEvent.click(retryButton)
    expect(mockOnRetry).toHaveBeenCalledTimes(1)
  })

  it('does not call onRetry when retry button is absent', () => {
    render(<ErrorMessage error={mockError} />)
    
    const retryButton = screen.queryByRole('button', { name: /Retry/i })
    expect(retryButton).not.toBeInTheDocument()
  })

  it('calls onClose when close button is provided', () => {
    render(<ErrorMessage error={mockError} onClose={mockOnClose} />)
    
    const closeButton = screen.getByRole('button', { name: /Close/i })
    expect(closeButton).toBeInTheDocument()
    
    fireEvent.click(closeButton)
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose when close button is absent', () => {
    render(<ErrorMessage error={mockError} />)
    
    const closeButton = screen.queryByRole('button', { name: /Close/i })
    expect(closeButton).not.toBeInTheDocument()
  })

  it('applies custom class name', () => {
    const customClass = 'custom-error-class'
    render(<ErrorMessage error={mockError} className={customClass} />)
    
    const errorContainer = screen.getByRole('alert')
    expect(errorContainer).toHaveClass(customClass)
  })

  it('provides role and aria-label for accessibility', () => {
    render(<ErrorMessage error={mockError} />)
    
    const errorContainer = screen.getByRole('alert')
    expect(errorContainer).toHaveAttribute('aria-label', 'Error message')
  })

  it('renders long error messages properly', () => {
    const longError = 'This is a very long error message. '.repeat(10)
    render(<ErrorMessage error={longError} />)
    
    const errorText = screen.getByTestId('error-text')
    // 텍스트가 포함되어 있는지만 확인
    expect(errorText.textContent).toContain('This is a very long error message.')
  })

  it('safely renders error message containing HTML tags', () => {
    const htmlError = '<script>alert("xss")</script>error message'
    render(<ErrorMessage error={htmlError} />)
    
    const errorContainer = screen.getByRole('alert')
    expect(errorContainer).toHaveTextContent('error message')
    expect(errorContainer.innerHTML).not.toContain('<script>')
  })

  it('renders correctly when both retry and close buttons are provided', () => {
    render(
      <ErrorMessage 
        error={mockError} 
        onRetry={mockOnRetry} 
        onClose={mockOnClose} 
      />
    )
    
    expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Close/i })).toBeInTheDocument()
  })

  it('applies correct styles to buttons', () => {
    render(<ErrorMessage error={mockError} onRetry={mockOnRetry} onClose={mockOnClose} />)
    
    const retryButton = screen.getByRole('button', { name: /Retry/i })
    const closeButton = screen.getByRole('button', { name: /Close/i })
    
    expect(retryButton).toHaveClass('bg-[#A8E6CF]', 'hover:bg-[#8DD5B8]')
    expect(closeButton).toHaveClass('bg-gray-500', 'hover:bg-gray-600')
  })
})
