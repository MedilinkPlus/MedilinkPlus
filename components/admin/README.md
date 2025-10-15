# 관리자 공통 컴포넌트

관리자 페이지에서 공통으로 사용할 수 있는 재사용 가능한 컴포넌트들입니다.

## 📋 컴포넌트 목록

### 1. AdminTable - 공통 테이블 컴포넌트

데이터를 테이블 형태로 표시하는 공통 컴포넌트입니다.

```tsx
import AdminTable, { AdminTableColumn } from '@/components/admin/AdminTable';

// 컬럼 정의
const columns: AdminTableColumn<User>[] = [
  {
    key: 'name',
    header: '이름',
    render: (user) => <span>{user.name}</span>
  },
  {
    key: 'email',
    header: '이메일',
    render: (user) => <span>{user.email}</span>
  }
];

// 사용법
<AdminTable
  data={users}
  columns={columns}
  loading={loading}
  emptyMessage="사용자가 없습니다."
  emptyIcon="ri-user-line"
/>
```

**Props:**
- `data`: 테이블에 표시할 데이터 배열
- `columns`: 테이블 컬럼 정의 배열
- `loading`: 로딩 상태 (기본값: false)
- `emptyMessage`: 데이터가 없을 때 표시할 메시지
- `emptyIcon`: 빈 상태 아이콘
- `onRowClick`: 행 클릭 이벤트 핸들러
- `className`: 추가 CSS 클래스

### 2. AdminForm - 공통 폼 컴포넌트

다양한 입력 필드를 포함한 폼 컴포넌트입니다.

```tsx
import AdminForm, { AdminFormField } from '@/components/admin/AdminForm';

// 폼 필드 정의
const fields: AdminFormField[] = [
  {
    name: 'name',
    label: '이름',
    type: 'text',
    placeholder: '이름을 입력하세요',
    required: true
  },
  {
    name: 'role',
    label: '역할',
    type: 'select',
    options: [
      { value: 'user', label: '사용자' },
      { value: 'admin', label: '관리자' }
    ],
    required: true
  }
];

// 사용법
<AdminForm
  fields={fields}
  values={formValues}
  onChange={handleChange}
  onSubmit={handleSubmit}
  submitText="저장"
  loading={false}
  gridCols={2}
/>
```

**지원하는 필드 타입:**
- `text`: 텍스트 입력
- `email`: 이메일 입력
- `password`: 비밀번호 입력
- `number`: 숫자 입력
- `select`: 선택 박스
- `textarea`: 텍스트 영역
- `date`: 날짜 선택
- `checkbox`: 체크박스
- `radio`: 라디오 버튼

### 3. ConfirmModal - 확인 모달 컴포넌트

사용자에게 확인을 요청하는 모달 컴포넌트입니다.

```tsx
import ConfirmModal from '@/components/admin/ConfirmModal';

// 사용법
<ConfirmModal
  isOpen={showDeleteModal}
  onClose={() => setShowDeleteModal(false)}
  onConfirm={handleDelete}
  title="사용자 삭제"
  message="정말로 이 사용자를 삭제하시겠습니까?"
  confirmText="삭제"
  cancelText="취소"
  type="danger"
  loading={false}
/>
```

**Props:**
- `isOpen`: 모달 표시 여부
- `onClose`: 모달 닫기 핸들러
- `onConfirm`: 확인 버튼 클릭 핸들러
- `title`: 모달 제목
- `message`: 확인 메시지
- `confirmText`: 확인 버튼 텍스트 (기본값: "확인")
- `cancelText`: 취소 버튼 텍스트 (기본값: "취소")
- `type`: 모달 타입 - "danger", "warning", "info" (기본값: "info")
- `loading`: 로딩 상태 (기본값: false)

### 4. EditModal - 편집 모달 컴포넌트

데이터 편집을 위한 모달 컴포넌트입니다.

```tsx
import EditModal from '@/components/admin/EditModal';

// 사용법
<EditModal
  isOpen={showEditModal}
  onClose={() => setShowEditModal(false)}
  onSave={handleSave}
  title="사용자 정보 수정"
  fields={editFormFields}
  initialValues={{
    name: user.name,
    email: user.email
  }}
  loading={false}
  saveText="저장"
  size="md"
/>
```

**Props:**
- `isOpen`: 모달 표시 여부
- `onClose`: 모달 닫기 핸들러
- `onSave`: 저장 버튼 클릭 핸들러
- `title`: 모달 제목
- `fields`: 폼 필드 정의 배열
- `initialValues`: 초기 값 객체
- `loading`: 로딩 상태 (기본값: false)
- `saveText`: 저장 버튼 텍스트 (기본값: "저장")
- `size`: 모달 크기 - "sm", "md", "lg", "xl" (기본값: "md")

### 5. SearchFilter - 검색 필터 컴포넌트

검색과 필터링을 위한 공통 컴포넌트입니다.

```tsx
import SearchFilter from '@/components/admin/SearchFilter';

// 필터 옵션 정의
const filterOptions = [
  {
    name: 'role',
    value: roleFilter,
    options: [
      { value: 'all', label: '모든 역할' },
      { value: 'user', label: '사용자' },
      { value: 'admin', label: '관리자' }
    ],
    onChange: setRoleFilter,
    placeholder: '역할 선택'
  }
];

// 사용법
<SearchFilter
  searchTerm={searchTerm}
  onSearchChange={setSearchTerm}
  searchPlaceholder="이름으로 검색..."
  filters={filterOptions}
  showSearch={true}
  showFilters={true}
/>
```

**Props:**
- `searchTerm`: 검색어
- `onSearchChange`: 검색어 변경 핸들러
- `searchPlaceholder`: 검색 입력 필드 플레이스홀더
- `filters`: 필터 옵션 배열
- `className`: 추가 CSS 클래스
- `showSearch`: 검색 입력 필드 표시 여부 (기본값: true)
- `showFilters`: 필터 옵션 표시 여부 (기본값: true)

## 🎯 사용 예시

### 전체 페이지 구조 예시

```tsx
export default function AdminPage() {
  // 상태 관리
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // 테이블 컬럼 정의
  const columns = [/* ... */];

  // 폼 필드 정의
  const formFields = [/* ... */];

  // 필터 옵션 정의
  const filterOptions = [/* ... */];

  return (
    <div>
      {/* 검색 및 필터 */}
      <SearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={filterOptions}
      />

      {/* 데이터 테이블 */}
      <AdminTable
        data={data}
        columns={columns}
        loading={loading}
      />

      {/* 편집 모달 */}
      <EditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSave}
        title="수정"
        fields={formFields}
        initialValues={initialValues}
      />

      {/* 삭제 확인 모달 */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="삭제 확인"
        message="정말로 삭제하시겠습니까?"
        type="danger"
      />
    </div>
  );
}
```

## 🎨 스타일링

모든 컴포넌트는 Tailwind CSS를 사용하며, 일관된 디자인 시스템을 따릅니다:

- **색상**: `#A8E6CF` (메인 컬러), `#FFD3B6` (보조 컬러)
- **둥근 모서리**: `rounded-xl`, `rounded-2xl`
- **그림자**: `shadow-sm`
- **테두리**: `border-gray-100`
- **호버 효과**: `hover:bg-gray-50`

## 🔧 커스터마이징

각 컴포넌트는 `className` prop을 통해 추가 스타일링이 가능하며, 필요한 경우 props를 확장하여 더 많은 기능을 추가할 수 있습니다.
