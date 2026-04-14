import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../api/auth';

interface Props {
  children: React.ReactNode;
}

const ROLE_LABEL: Record<string, string> = {
  '99': '관리자',
  '2': '발송가능',
  '3': '일반',
};

export default function Layout({ children }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = localStorage.getItem('userId') ?? '';
  const userType = localStorage.getItem('userType') ?? '';

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('userType');
      navigate('/login');
    }
  };

  const navItems = [
    { path: '/messages', label: '발송 조회', types: ['99', '2', '3'] },
    { path: '/send',     label: '발송 요청', types: ['99', '2'] },
    { path: '/agent',    label: '에이전트 처리', types: ['99'] },
  ].filter((item) => item.types.includes(userType));

  return (
    <div style={styles.page}>
      {/* 헤더 */}
      <div style={styles.header}>
        <span style={styles.headerTitle}>OMS 관리</span>
        <div style={styles.headerRight}>
          <span style={styles.roleLabel}>{ROLE_LABEL[userType] ?? userType}</span>
          <span style={styles.userInfo}>{userId}</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>로그아웃</button>
        </div>
      </div>

      {/* 네비게이션 탭 */}
      <div style={styles.nav}>
        {navItems.map((item) => (
          <button
            key={item.path}
            style={{
              ...styles.navItem,
              ...(location.pathname === item.path ? styles.navItemActive : {}),
            }}
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* 컨텐츠 */}
      <div>{children}</div>
    </div>
  );
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
  roleLabel: {
    fontSize: '12px',
    color: '#fff',
    backgroundColor: '#1890ff',
    padding: '2px 8px',
    borderRadius: '10px',
  },
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
  nav: {
    backgroundColor: '#fff',
    borderBottom: '1px solid #e8e8e8',
    padding: '0 24px',
    display: 'flex',
    gap: '4px',
  },
  navItem: {
    padding: '14px 20px',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    fontSize: '14px',
    color: '#555',
    cursor: 'pointer',
    fontWeight: 500,
  },
  navItemActive: {
    color: '#1890ff',
    borderBottom: '2px solid #1890ff',
  },
};