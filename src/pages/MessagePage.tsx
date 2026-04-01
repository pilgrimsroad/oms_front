import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchMessages } from '../api/messages';
import { logout } from '../api/auth';
import type { MessageResponse, MessageSearchRequest } from '../types';
import DateInput from '../components/DateInput';

const MSG_TYPE_OPTIONS = [
  { value: '', label: '전체' },
  { value: '1', label: 'SMS' },
  { value: '2', label: 'LMS' },
  { value: '3', label: 'MMS' },
  { value: '6', label: '알림톡' },
  { value: '7', label: '친구톡' },
  { value: '8', label: 'AI알림톡' },
  { value: '9', label: 'RCS SMS' },
  { value: '10', label: 'RCS LMS' },
  { value: '11', label: 'RCS MMS' },
  { value: '12', label: 'RCS 템플릿' },
  { value: '13', label: 'RCS 이미지템플릿' },
];

const STATUS_OPTIONS = [
  { value: '', label: '전체' },
  { value: '0', label: '대기' },
  { value: '2', label: '완료' },
  { value: '9', label: '실패' },
];

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
};

export default function MessagePage() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId') ?? '';

  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState(today());
  const [msgType, setMsgType] = useState('');
  const [status, setStatus] = useState('');
  const [recipient, setRecipient] = useState('');

  const [results, setResults] = useState<MessageResponse[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [popupMsg, setPopupMsg] = useState<MessageResponse | null>(null);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const req: MessageSearchRequest = { startDate, endDate };
    if (msgType) req.msgType = Number(msgType);
    if (status) req.status = Number(status);
    if (recipient) req.recipient = recipient;

    try {
      const data = await searchMessages(req);
      setResults(data);
      setSearched(true);
    } catch (err: any) {
      setError(err.response?.data?.error ?? '조회에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userId');
      navigate('/login');
    }
  };

  return (
    <div style={styles.page}>
      {/* 헤더 */}
      <div style={styles.header}>
        <span style={styles.headerTitle}>OMS 메시지 조회</span>
        <div style={styles.headerRight}>
          <span style={styles.userInfo}>{userId}</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>로그아웃</button>
        </div>
      </div>

      {/* 검색 폼 */}
      <div style={styles.searchBox}>
        <form onSubmit={handleSearch} style={styles.form}>
          <div style={styles.row}>
            <DateInput label="시작일" value={startDate} onChange={setStartDate} />
            <DateInput label="종료일" value={endDate} onChange={setEndDate} />
            <div style={styles.field}>
              <label style={styles.label}>메시지 유형</label>
              <select style={styles.input} value={msgType} onChange={(e) => setMsgType(e.target.value)}>
                {MSG_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>상태</label>
              <select style={styles.input} value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>수신번호</label>
              <input
                style={styles.input}
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="선택 입력"
              />
            </div>
            <button style={styles.searchBtn} type="submit" disabled={loading}>
              {loading ? '조회 중...' : '조회'}
            </button>
          </div>
        </form>
      </div>

      {/* 에러 */}
      {error && <p style={styles.error}>{error}</p>}

      {/* 메시지 내용 팝업 */}
      {popupMsg && (
        <div style={styles.overlay} onClick={() => setPopupMsg(null)}>
          <div style={styles.popup} onClick={(e) => e.stopPropagation()}>
            <div style={styles.popupHeader}>
              <span style={styles.popupTitle}>메시지 내용</span>
              <button style={styles.popupClose} onClick={() => setPopupMsg(null)}>✕</button>
            </div>
            <div style={styles.popupBody}>
              <div style={styles.popupRow}>
                <span style={styles.popupLabel}>제목</span>
                <span style={styles.popupValue}>{popupMsg.subject}</span>
              </div>
              <div style={styles.popupRow}>
                <span style={styles.popupLabel}>유형</span>
                <span style={styles.popupValue}>{popupMsg.msgTypeNm}</span>
              </div>
              <div style={styles.popupDivider} />
              <div style={styles.popupContent}>{popupMsg.message}</div>
            </div>
          </div>
        </div>
      )}

      {/* 결과 테이블 */}
      {searched && (
        <div style={styles.tableWrap}>
          <p style={{...styles.resultCount,textAlign:'right'}}>총 {results.length}건</p>
          {results.length === 0 ? (
            <p style={styles.empty}>조회 결과가 없습니다.</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  {['ID', '제목', '내용', '유형', '상태', '수신번호', '발송시간', '결과'].map((h) => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((msg) => (
                  <tr key={msg.msgId} style={styles.tr}>
                    <td style={styles.td}>{msg.msgId}</td>
                    <td style={{ ...styles.td, textAlign: 'left' }}>{msg.subject}</td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <button style={styles.iconBtn} onClick={() => setPopupMsg(msg)} title="내용 보기">
                        💬
                      </button>
                    </td>
                    <td style={styles.td}>{msg.msgTypeNm}</td>
                    <td style={{ ...styles.td, ...statusStyle(msg.status) }}>{msg.statusNm}</td>
                    <td style={styles.td}>{msg.rcptData}</td>
                    <td style={styles.td}>{formatTime(msg.submitTime)}</td>
                    <td style={styles.td}>{msg.result}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

function formatTime(t: string): string {
  if (!t || t.length < 14) return t;
  return `${t.slice(0, 4)}-${t.slice(4, 6)}-${t.slice(6, 8)} ${t.slice(8, 10)}:${t.slice(10, 12)}:${t.slice(12, 14)}`;
}

function statusStyle(status: string | number): React.CSSProperties {
  const code = typeof status === 'string' ? Number(status) : status;
  if (code === 9) return { color: '#ff4d4f', fontWeight: 600 };
  if (code === 2 || code === 4 || code === 6 || code === 8) return { color: '#52c41a', fontWeight: 600 };
  return { color: '#faad14', fontWeight: 600 };
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', backgroundColor: '#f0f2f5', fontFamily: 'sans-serif' },
  header: {
    backgroundColor: '#001529',
    color: '#fff',
    padding: '0 24px',
    height: '56px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: '18px', fontWeight: 600 },
  headerRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  userInfo: { fontSize: '14px', color: '#ccc' },
  logoutBtn: {
    padding: '5px 14px',
    backgroundColor: 'transparent',
    border: '1px solid #ccc',
    color: '#ccc',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  searchBox: {
    backgroundColor: '#fff',
    margin: '24px',
    padding: '20px 24px',
    borderRadius: '8px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
  },
  form: {},
  row: { display: 'flex', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', color: '#555', fontWeight: 500 },
  input: {
    padding: '8px 10px',
    border: '1px solid #d9d9d9',
    borderRadius: '4px',
    fontSize: '14px',
    minWidth: '120px',
  },
  searchBtn: {
    padding: '8px 24px',
    backgroundColor: '#1890ff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    height: '36px',
  },
  error: { color: '#ff4d4f', margin: '0 24px' },
  tableWrap: {
    backgroundColor: '#fff',
    margin: '0 24px 24px',
    padding: '16px 24px',
    borderRadius: '8px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
    overflowX: 'auto',
  },
  resultCount: { fontSize: '14px', color: '#666', marginBottom: '12px' },
  empty: { textAlign: 'center', color: '#999', padding: '40px 0' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { backgroundColor: '#fafafa' },
  th: {
    padding: '10px 12px',
    textAlign: 'center',
    fontSize: '13px',
    color: '#555',
    borderBottom: '1px solid #e8e8e8',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  tr: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '10px 12px', fontSize: '13px', color: '#333', whiteSpace: 'nowrap' },
  iconBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '2px 6px',
    borderRadius: '4px',
    lineHeight: 1,
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  popup: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    width: '480px',
    maxWidth: '90vw',
    boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
    overflow: 'hidden',
  },
  popupHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 20px',
    borderBottom: '1px solid #f0f0f0',
    backgroundColor: '#fafafa',
  },
  popupTitle: { fontWeight: 600, fontSize: '15px', color: '#333' },
  popupClose: {
    background: 'none',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    color: '#999',
    lineHeight: 1,
  },
  popupBody: { padding: '20px' },
  popupRow: { display: 'flex', gap: '12px', marginBottom: '10px', alignItems: 'baseline' },
  popupLabel: { fontSize: '12px', color: '#888', width: '36px', flexShrink: 0 },
  popupValue: { fontSize: '14px', color: '#333' },
  popupDivider: { borderTop: '1px solid #f0f0f0', margin: '14px 0' },
  popupContent: {
    fontSize: '14px',
    color: '#333',
    lineHeight: '1.7',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    minHeight: '60px',
  },
};
