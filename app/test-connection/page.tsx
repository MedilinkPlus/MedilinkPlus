'use client';

import { useState, useEffect } from 'react';

export default function TestConnectionPage() {
  const [connectionStatus, setConnectionStatus] = useState<string>('테스트 중...');
  const [envVars, setEnvVars] = useState<any>({});

  useEffect(() => {
    // 환경 변수 확인
    const env = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      nodeEnv: process.env.NODE_ENV,
    };
    setEnvVars(env);

    // Supabase 연결 테스트
    testSupabaseConnection();
  }, []);

  const testSupabaseConnection = async () => {
    try {
      // 환경 변수 확인
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        setConnectionStatus('❌ 환경 변수가 설정되지 않았습니다');
        return;
      }

      // Supabase 클라이언트 동적 import
      const { createClient } = await import('@supabase/supabase-js');
      
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );

      // 연결 테스트 (간단한 쿼리)
      const { data, error } = await supabase.from('users').select('count').limit(1);
      
      if (error) {
        setConnectionStatus(`❌ 연결 실패: ${error.message}`);
      } else {
        setConnectionStatus('✅ Supabase 연결 성공!');
      }
    } catch (error: any) {
      setConnectionStatus(`❌ 오류 발생: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#A8E6CF]/20 via-[#FFD3B6]/20 to-[#E0BBE4]/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl font-pacifico text-[#A8E6CF] mb-2">
            MediLink+
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">연결 테스트</h1>
          <p className="text-gray-600">Supabase 연결 상태를 확인합니다</p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-8">
          {/* 연결 상태 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">연결 상태</h3>
            <div className={`p-4 rounded-2xl text-center ${
              connectionStatus.includes('✅') ? 'bg-green-50 text-green-700' : 
              connectionStatus.includes('❌') ? 'bg-red-50 text-red-700' : 
              'bg-blue-50 text-blue-700'
            }`}>
              {connectionStatus}
            </div>
          </div>

          {/* 환경 변수 상태 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">환경 변수</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">SUPABASE_URL:</span>
                <span className={`font-mono text-sm ${
                  envVars.supabaseUrl ? 'text-green-600' : 'text-red-600'
                }`}>
                  {envVars.supabaseUrl ? '✅ 설정됨' : '❌ 설정 안됨'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">SUPABASE_ANON_KEY:</span>
                <span className={`font-mono text-sm ${
                  envVars.supabaseAnonKey ? 'text-green-600' : 'text-red-600'
                }`}>
                  {envVars.supabaseAnonKey ? '✅ 설정됨' : '❌ 설정 안됨'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">NODE_ENV:</span>
                <span className="font-mono text-sm text-gray-800">
                  {envVars.nodeEnv || 'undefined'}
                </span>
              </div>
            </div>
          </div>

          {/* 재테스트 버튼 */}
          <button
            onClick={testSupabaseConnection}
            className="w-full bg-[#A8E6CF] text-white py-3 px-4 rounded-2xl font-medium hover:bg-[#8DD5C0] transition-colors"
          >
            연결 재테스트
          </button>

          {/* 안내 메시지 */}
          <div className="mt-6 p-4 bg-blue-50 rounded-2xl">
            <h4 className="font-medium text-blue-800 mb-2">환경 변수 설정 방법:</h4>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>프로젝트 루트에 <code className="bg-blue-100 px-1 rounded">.env.local</code> 파일 생성</li>
              <li>Supabase 프로젝트 URL과 Anon Key 입력</li>
              <li>개발 서버 재시작</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
