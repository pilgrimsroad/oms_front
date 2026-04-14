import { useState, useMemo, type FormEvent } from 'react';

// 한글 2byte, 영문/숫자/기타 1byte
function getByteLength(str: string): number {
  let bytes = 0;
  for (const char of str) {
    bytes += char.charCodeAt(0) > 127 ? 2 : 1;
  }
  return bytes;
}

// 유형별 최대 byte (SMS=80, LMS/MMS=2000, 나머지는 제한 없음)
function getMaxBytes(msgType: number): number | null {
  if (msgType === 1) return 80;
  if (msgType === 2 || msgType === 3) return 2000;
  return null;
}
import { sendMessage } from '../api/messages';
import type { MessageSendResponse } from '../types';
import Layout from '../components/Layout';

const MSG_TYPE_OPTIONS = [
  { value: 1,  label: 'SMS' },
  { value: 2,  label: 'LMS' },
  { value: 3,  label: 'MMS' },
  { value: 6,  label: '알림톡' },
  { value: 7,  label: '친구톡' },
  { value: 8,  label: 'AI알림톡' },
  { value: 9,  label: 'RCS SMS' },
  { value: 10, label: 'RCS LMS' },
  { value: 11, label: 'RCS MMS' },
  { value: 12, label: 'RCS 템플릿' },
  { value: 13, label: 'RCS 이미지템플릿' },
];

export default function SendPage() {
  const [msgType, setMsgType]         = useState(1);
  const [callbackNum, setCallbackNum] = useState('');
  const [rcptData, setRcptData]       = useState('');
  const [subject, setSubject]         = useState('');
  const [message, setMessage]         = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState<MessageSendResponse | null>(null);
  const [error, setError]       = useState('');

  const byteLength = useMemo(() => getByteLength(message), [message]);
  const maxBytes   = useMemo(() => getMaxBytes(msgType), [msgType]);
  const isOverLimit = maxBytes !== null && byteLength > maxBytes;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const res = await sendMessage({
        msgType,
        callbackNum,
        rcptData,
        subject: subject || undefined,
        message,
        scheduleTime: scheduleTime || undefined,
      });
      setResult(res);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error;
      setError(msg ?? '발송 요청에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCallbackNum('');
    setRcptData('');
    setSubject('');
    setMessage('');
    setScheduleTime('');
    setResult(null);
    setError('');
  };

  return (
    <Layout>
      <div style={styles.wrap}>
        <div style={styles.card}>
          <h3 style={styles.title}>발송 요청</h3>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>메시지 유형 *</label>
                <select style={{ ...styles.input, height: '44px' }} value={msgType} onChange={(e) => setMsgType(Number(e.target.value))}>
                  {MSG_TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>발신 번호 *</label>
                <input
                  style={styles.input}
                  type="text"
                  value={callbackNum}
                  onChange={(e) => setCallbackNum(e.target.value)}
                  placeholder="01000000000"
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>수신 번호 *</label>
                <input
                  style={styles.input}
                  type="text"
                  value={rcptData}
                  onChange={(e) => setRcptData(e.target.value)}
                  placeholder="01012345678"
                  required
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>제목 (LMS/MMS)</label>
              <input
                style={styles.input}
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="선택 입력"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>메시지 내용 *</label>
              <textarea
                style={{
                  ...styles.textarea,
                  borderColor: isOverLimit ? '#ff4d4f' : '#d9d9d9',
                }}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="발송할 메시지를 입력하세요."
                required
                rows={5}
              />
              <div style={styles.byteRow}>
                {isOverLimit && (
                  <span style={styles.byteWarn}>
                    바이트 초과 — 발송 불가
                  </span>
                )}
                <span style={{ ...styles.byteCount, color: isOverLimit ? '#ff4d4f' : '#999', marginLeft: 'auto' }}>
                  {byteLength}{maxBytes !== null ? ` / ${maxBytes} byte` : ' byte'}
                </span>
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>예약 발송 시간 (yyyyMMddHHmmss)</label>
              <input
                style={styles.input}
                type="text"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                placeholder="비워두면 즉시 발송 요청"
                maxLength={14}
              />
            </div>

            {error && <p style={styles.error}>{error}</p>}

            <div style={styles.btnRow}>
              <button style={{ ...styles.submitBtn, opacity: (loading || isOverLimit) ? 0.5 : 1 }} type="submit" disabled={loading || isOverLimit}>
                {loading ? '요청 중...' : '발송 요청'}
              </button>
              <button style={styles.resetBtn} type="button" onClick={handleReset}>
                초기화
              </button>
            </div>
          </form>
        </div>

        {result && (
          <div style={styles.resultCard}>
            <h4 style={styles.resultTitle}>발송 요청 완료</h4>
            <table style={styles.resultTable}>
              <tbody>
                <tr><td style={styles.rtd}>메시지 ID</td><td style={styles.rtdVal}>{result.msgId}</td></tr>
                <tr><td style={styles.rtd}>수신 번호</td><td style={styles.rtdVal}>{result.rcptData}</td></tr>
                <tr><td style={styles.rtd}>상태</td><td style={styles.rtdVal}>대기 ({result.status})</td></tr>
                <tr><td style={styles.rtd}>요청 일시</td><td style={styles.rtdVal}>{formatTime(result.requestedAt)}</td></tr>
                <tr><td style={styles.rtd}>처리 메시지</td><td style={{ ...styles.rtdVal, color: '#52c41a', fontWeight: 600 }}>{result.message}</td></tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}

function formatTime(t: string): string {
  if (!t || t.length < 14) return t;
  return `${t.slice(0,4)}-${t.slice(4,6)}-${t.slice(6,8)} ${t.slice(8,10)}:${t.slice(10,12)}:${t.slice(12,14)}`;
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' },
  card: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '28px 32px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
    maxWidth: '720px',
  },
  title: { margin: '0 0 24px', fontSize: '16px', fontWeight: 600, color: '#333' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  row: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '180px' },
  label: { fontSize: '13px', color: '#555', fontWeight: 500 },
  input: {
    padding: '8px 10px',
    border: '1px solid #d9d9d9',
    borderRadius: '4px',
    fontSize: '14px',
  },
  textarea: {
    padding: '8px 10px',
    border: '1px solid #d9d9d9',
    borderRadius: '4px',
    fontSize: '14px',
    resize: 'none',
    overflowY: 'auto',
    fontFamily: 'inherit',
  },
  btnRow: { display: 'flex', gap: '12px', marginTop: '8px' },
  submitBtn: {
    padding: '9px 28px',
    backgroundColor: '#1890ff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: 500,
  },
  resetBtn: {
    padding: '9px 20px',
    backgroundColor: '#fff',
    color: '#555',
    border: '1px solid #d9d9d9',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  byteRow: { display: 'flex', alignItems: 'center', marginTop: '4px' },
  byteCount: { fontSize: '12px' },
  byteWarn: { fontSize: '12px', color: '#ff4d4f', fontWeight: 500 },
  error: { color: '#ff4d4f', fontSize: '13px', margin: 0 },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '20px 28px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
    maxWidth: '720px',
    borderLeft: '4px solid #52c41a',
  },
  resultTitle: { margin: '0 0 16px', fontSize: '15px', fontWeight: 600, color: '#333' },
  resultTable: { borderCollapse: 'collapse', width: '100%' },
  rtd: {
    padding: '8px 16px 8px 0',
    fontSize: '13px',
    color: '#888',
    width: '100px',
    verticalAlign: 'top',
  },
  rtdVal: { padding: '8px 0', fontSize: '14px', color: '#333' },
};
