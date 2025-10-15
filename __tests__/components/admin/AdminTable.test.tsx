import { render, screen, fireEvent } from '@testing-library/react'
import AdminTable, { AdminTableColumn } from '@/components/admin/AdminTable'

interface TestData {
  id: string
  name: string
  email: string
  status: string
}

const mockData: TestData[] = [
  { id: '1', name: '김철수', email: 'kim@test.com', status: 'active' },
  { id: '2', name: '이영희', email: 'lee@test.com', status: 'inactive' },
  { id: '3', name: '박민수', email: 'park@test.com', status: 'active' },
]

const mockColumns: AdminTableColumn<TestData>[] = [
  {
    key: 'name',
    header: '이름',
    render: (item) => <span data-testid={`name-${item.id}`}>{item.name}</span>
  },
  {
    key: 'email',
    header: '이메일',
    render: (item) => <span data-testid={`email-${item.id}`}>{item.email}</span>
  },
  {
    key: 'status',
    header: '상태',
    render: (item) => (
      <span 
        data-testid={`status-${item.id}`}
        className={item.status === 'active' ? 'text-green-600' : 'text-red-600'}
      >
        {item.status === 'active' ? '활성' : '비활성'}
      </span>
    )
  }
]

describe('AdminTable', () => {
  it('테이블 헤더를 렌더링합니다', () => {
    render(<AdminTable data={mockData} columns={mockColumns} />)
    
    expect(screen.getByText('이름')).toBeInTheDocument()
    expect(screen.getByText('이메일')).toBeInTheDocument()
    expect(screen.getByText('상태')).toBeInTheDocument()
  })

  it('데이터 행을 렌더링합니다', () => {
    render(<AdminTable data={mockData} columns={mockColumns} />)
    
    expect(screen.getByTestId('name-1')).toHaveTextContent('김철수')
    expect(screen.getByTestId('email-1')).toHaveTextContent('kim@test.com')
    expect(screen.getByTestId('status-1')).toHaveTextContent('활성')
  })

  it('로딩 상태를 표시합니다', () => {
    render(<AdminTable data={mockData} columns={mockColumns} loading={true} />)
    
    const loadingSpinner = screen.getByRole('status')
    expect(loadingSpinner).toBeInTheDocument()
  })

  it('데이터가 없을 때 빈 상태 메시지를 표시합니다', () => {
    const emptyMessage = '데이터가 없습니다.'
    render(
      <AdminTable 
        data={[]} 
        columns={mockColumns} 
        emptyMessage={emptyMessage}
        emptyIcon="ri-inbox-line"
      />
    )
    
    expect(screen.getByText(emptyMessage)).toBeInTheDocument()
    expect(screen.getByTestId('empty-icon')).toHaveClass('ri-inbox-line')
  })

  it('사용자 정의 클래스명을 적용합니다', () => {
    const customClass = 'custom-table-class'
    render(
      <AdminTable 
        data={mockData} 
        columns={mockColumns} 
        className={customClass}
      />
    )
    
    const table = screen.getByRole('table')
    expect(table).toHaveClass(customClass)
  })

  it('테이블 접근성을 제공합니다', () => {
    render(<AdminTable data={mockData} columns={mockColumns} />)
    
    const table = screen.getByRole('table')
    expect(table).toBeInTheDocument()
    
    const headers = screen.getAllByRole('columnheader')
    expect(headers).toHaveLength(3)
    
    const rows = screen.getAllByRole('row')
    expect(rows).toHaveLength(4) // 헤더 + 3개 데이터 행
  })

  it('복잡한 렌더링 함수를 올바르게 처리합니다', () => {
    const complexColumns: AdminTableColumn<TestData>[] = [
      {
        key: 'complex',
        header: '복합 정보',
        render: (item) => (
          <div data-testid={`complex-${item.id}`}>
            <span className="font-bold">{item.name}</span>
            <span className="text-sm text-gray-500">({item.email})</span>
          </div>
        )
      }
    ]
    
    render(<AdminTable data={mockData} columns={complexColumns} />)
    
    const complexElement = screen.getByTestId('complex-1')
    expect(complexElement).toBeInTheDocument()
    expect(complexElement).toHaveTextContent('김철수')
    expect(complexElement).toHaveTextContent('(kim@test.com)')
  })

  it('빈 데이터 배열을 안전하게 처리합니다', () => {
    render(<AdminTable data={[]} columns={mockColumns} />)
    
    expect(screen.getByText('데이터가 없습니다.')).toBeInTheDocument()
  })

  it('null 또는 undefined 데이터를 안전하게 처리합니다', () => {
    const dataWithNull = [
      { id: '1', name: '김철수', email: 'kim@test.com', status: 'active' },
      { id: '2', name: null, email: undefined, status: 'inactive' },
    ]
    
    render(<AdminTable data={dataWithNull} columns={mockColumns} />)
    
    expect(screen.getByTestId('name-1')).toHaveTextContent('김철수')
    expect(screen.getByTestId('name-2')).toHaveTextContent('')
  })

  it('테이블 스타일링이 올바르게 적용됩니다', () => {
    render(<AdminTable data={mockData} columns={mockColumns} />)
    
    const table = screen.getByRole('table')
    expect(table).toHaveClass('min-w-full', 'divide-y', 'divide-gray-200')
    
    const headerRow = screen.getAllByRole('row')[0]
    expect(headerRow).toHaveClass('bg-gray-50')
  })

  it('상태별 색상이 올바르게 적용됩니다', () => {
    render(<AdminTable data={mockData} columns={mockColumns} />)
    
    const activeStatus = screen.getByTestId('status-1')
    const inactiveStatus = screen.getByTestId('status-2')
    
    expect(activeStatus).toHaveClass('text-green-600')
    expect(inactiveStatus).toHaveClass('text-red-600')
  })
})
