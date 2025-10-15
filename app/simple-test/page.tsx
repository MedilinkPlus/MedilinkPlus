export default function SimpleTestPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-red-600 mb-4">
        간단한 Tailwind 테스트
      </h1>
      
      <div className="bg-blue-500 text-white p-4 rounded mb-4">
        파란색 배경, 흰색 텍스트
      </div>
      
      <div className="bg-green-500 text-white p-4 rounded mb-4">
        초록색 배경, 흰색 텍스트
      </div>
      
      <div className="bg-yellow-500 text-black p-4 rounded mb-4">
        노란색 배경, 검은색 텍스트
      </div>
      
      <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded">
        보라색 버튼
      </button>
    </div>
  );
}
