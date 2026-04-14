import { useState, useEffect } from 'react';
import { processAgent, getPendingCount } from '../api/messages';
import type { AgentProcessResponse } from '../types';
import Layout from '../components/Layout';

export default function AgentPage() {
  const [loading, setLoading]         = useState(false);
  const [result, setResult]           = useState<AgentProcessResponse | null>(null);
  const [error, setError]             = useState('');
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [countLoading, setCountLoading] = useState(true);

  const fetchPendingCount = async () => {
    setCountLoading(true);
    try {
      const count = await getPendingCount();
      setPendingCount(count);
    } catch {
      setPendingCount(null);
    } finally {
      setCountLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingCount();
  }, []);

  const handleProcess = async () => {
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const res = await processAgent();
      setResult(res);
      fetchPendingCount();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error;
      setError(msg ?? '처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div style={styles.wrap}>
        <div style={styles.card}>
          <h3 style={styles.title}>에이전트 처리</h3>
          <p style={styles.desc}>
            발송 대기(status=0) 상태인 메시지를 일괄 처리합니다.<br />
            처리된 메시지는 발송 완료(status=2)로 변경됩니다.
          </p>

          <div style={styles.pendingBox}>
            {countLoading ? (
              <span style={styles.pendingText}>대기 건수 조회 중...</span>
            ) : pendingCount === null ? (
              <span style={{ ...styles.pendingText, color: '#ff4d4f' }}>대기 건수 조회 실패</span>
            ) : pendingCount === 0 ? (
              <span style={styles.pendingText}>현재 발송 대기 건이 없습니다.</span>
            ) : (
              <span style={{ ...styles.pendingText, color: '#fa8c16', fontWeight: 600 }}>
                현재 발송 대기 건수: {pendingCount.toLocaleString()}건
              </span>
            )}
          </div>

          <button style={styles.btn} onClick={handleProcess} disabled={loading}>
            {loading ? '처리 중...' : '발송 대기 처리 실행'}
          </button>

          {error && <p style={styles.error}>{error}</p>}

          {result && (
            <div style={{
              ...styles.resultBox,
              borderColor: result.processedCount > 0 ? '#52c41a' : '#faad14',
            }}>
              <span style={styles.resultIcon}>{result.processedCount > 0 ? '✓' : '—'}</span>
              <span style={styles.resultText}>{result.message}</span>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { padding: '24px' },
  card: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '28px 32px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
    maxWidth: '520px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  title: { margin: 0, fontSize: '16px', fontWeight: 600, color: '#333' },
  desc: { margin: 0, fontSize: '14px', color: '#666', lineHeight: '1.7' },
  btn: {
    padding: '10px 28px',
    backgroundColor: '#1890ff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: 500,
    alignSelf: 'flex-start',
  },
  pendingBox: {
    padding: '12px 16px',
    backgroundColor: '#fafafa',
    border: '1px solid #e8e8e8',
    borderRadius: '6px',
  },
  pendingText: { fontSize: '14px', color: '#555' },
  error: { color: '#ff4d4f', fontSize: '13px', margin: 0 },
  resultBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 18px',
    border: '1px solid',
    borderRadius: '6px',
    backgroundColor: '#f6ffed',
  },
  resultIcon: { fontSize: '18px', color: '#52c41a', fontWeight: 700 },
  resultText: { fontSize: '15px', fontWeight: 500, color: '#333' },
};
