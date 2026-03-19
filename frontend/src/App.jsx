import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom'
import axios from 'axios'
import { jwtDecode } from "jwt-decode"
import CalendarHeatmap from 'react-calendar-heatmap'
import 'react-calendar-heatmap/dist/styles.css'

// --- 1. BUBBLE BACKGROUND ---
const Background = () => {
  const bubbles = Array.from({ length: 40 }, (_, i) => ({
    id: i, size: Math.floor(Math.random() * 80) + 20, left: Math.floor(Math.random() * 100),
    delay: Math.random() * 5, duration: Math.floor(Math.random() * 12) + 5,
    moveX: Math.floor(Math.random() * 300) - 150,
  }));
  return (
    <div style={styles.canvas}>
      <style>{`
        @keyframes moveBubble {
          0% { bottom: -100px; transform: translateX(0); opacity: 0.8; }
          100% { bottom: 100vh; transform: translateX(var(--moveX)); opacity: 0; }
        }
      `}</style>
      {bubbles.map((b) => (
        <div key={b.id} style={{
          ...styles.bubble, width: b.size, height: b.size, left: `${b.left}vw`,
          animationDuration: `${b.duration}s`, animationDelay: `${b.delay}s`, '--moveX': `${b.moveX}px`
        }} />
      ))}
    </div>
  );
};

// --- 2. AUTH COMPONENTS ---
const Home = () => (
  <div style={styles.authPage}>
    <div style={{ ...styles.authCard, maxWidth: '550px', background: 'rgba(255,255,255,0.9)' }}>
      <h1 style={{ fontSize: '4rem', fontWeight:'bold', color: '#0b1775', margin: 0 }}>Vault Pro 🚀</h1>
      <p style={{ fontSize: '1.2rem', color: '#333', margin: '20px 0 40px' }}>Master your habits. Track your progress. Own your data.</p>
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
        <Link to="/login"><button style={styles.btnPrimary}>Enter Vault</button></Link>
        <Link to="/register"><button style={{ ...styles.btnPrimary, backgroundColor: '#34a853' }}>Join Now</button></Link>
      </div>
    </div>
  </div>
);

const Login = ({ setToken }) => {
  const [user, setUser] = useState({ username: '', password: '' });
  const navigate = useNavigate();
  const handleLogin = () => {
    axios.post('http://localhost:5000/login', user)
      .then(res => {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        navigate('/vault');
      }).catch(() => alert("Invalid Credentials"));
  };
  return (
    <div style={styles.authPage}><div style={styles.authCard}>
      <h2 style={styles.title}>Welcome Back 🔑</h2>
      <input style={styles.input} type="text" placeholder="Username" onChange={e => setUser({...user, username: e.target.value})} />
      <input style={styles.input} type="password" placeholder="Password" onChange={e => setUser({...user, password: e.target.value})} />
      <button style={styles.btnPrimary} onClick={handleLogin}>Login</button>
      <p style={styles.linkText}>New? <Link to="/register">Register</Link> | <Link to="/">Home</Link></p>
    </div></div>
  );
}

const Register = () => {
  // 1. Initialize with empty strings to avoid "undefined" errors
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  
  const handleRegister = (e) => {
    e.preventDefault(); // Prevents page reload
    if (!username || !password) return alert("Please fill all fields");

    console.log("Attempting to register:", username); // Debugging line

    axios.post('http://localhost:5000/register', { username, password })
      .then((res) => { 
        alert("Account Created! Please Login."); 
        navigate('/login'); 
      })
      .catch((err) => {
        console.error("Registration Error:", err.response?.data);
        alert(err.response?.data?.error || "Registration Failed");
      });
  };

  return (
    <div style={styles.authPage}>
      <div style={styles.authCard}>
        <h2 style={styles.title}>Join the Vault 📝</h2>
        <input 
          style={styles.input} 
          type="text" 
          placeholder="Username" 
          value={username} // Added value binding
          onChange={e => setUsername(e.target.value)} 
        />
        <input 
          style={styles.input} 
          type="password" 
          placeholder="Password" 
          value={password} // Added value binding
          onChange={e => setPassword(e.target.value)} 
        />
        <button style={styles.btnPrimary} onClick={handleRegister}>
          Create Account
        </button>
        <div style={{marginTop: '10px'}}>
          <p style={styles.linkText}>Back to <Link to="/login">Login</Link></p>
          <p style={styles.linkText}><Link to="/">← Back to Home</Link></p>
        </div>
      </div>
    </div>
  );
}


// --- 3. VAULT COMPONENT ---
const Vault = ({ setToken }) => {
  const [task, setTask] = useState("");
  const [tasksList, setTasksList] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const decoded = jwtDecode(token);
  const userId = decoded.userId;

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = () => {
    axios.get(`http://localhost:5000/tasks/${userId}`).then(res => setTasksList(res.data));
  };

  const calculateStreak = (dates) => {
    if (!dates || !dates.length) return 0;
    const sorted = [...new Set(dates)].sort().reverse();
    let streak = 0;
    let checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);
    for (let i = 0; i < sorted.length; i++) {
      const d = new Date(sorted[i]);
      d.setHours(0, 0, 0, 0);
      const diff = Math.floor((checkDate - d) / (1000 * 60 * 60 * 24));
      if (diff === 0 || diff === 1) { streak++; checkDate = d; } else { break; }
    }
    return streak;
  };

  const getLast7Days = () => {
    return [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();
  };

  const filteredTasks = tasksList.filter(t => t.text.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={{ margin: 0, color: '#0b1775' }}>Habit Vault 🔐</h1>
        <button style={styles.btnDanger} onClick={() => { localStorage.removeItem('token'); setToken(null); navigate('/'); }}>Logout</button>
      </div>

      <div style={styles.inputArea}>
        <input style={styles.taskInput} value={task} onChange={e => setTask(e.target.value)} placeholder="New habit..." />
        <button style={styles.btnAdd} onClick={() => {
           if(!task) return;
           axios.post('http://localhost:5000/tasks', { text: task, userId }).then(() => { fetchTasks(); setTask(""); });
        }}>Start</button>
      </div>

      <div style={{ marginTop: '40px', marginBottom: '40px', width: '100%', maxWidth: '700px', marginLeft: 'auto', marginRight: 'auto' }}> 
        <input 
          style={styles.input} 
          placeholder="🔍 Search your habits..." 
          onChange={e => setSearch(e.target.value)} 
        />
      </div>

      <div style={styles.taskList}>
        {filteredTasks.map((t) => {
          const streak = calculateStreak(t.completedDates);
          const last7Days = getLast7Days();
          const isDoneToday = t.completedDates?.includes(new Date().toISOString().split('T')[0]);
          return (
            <div key={t._id} style={styles.taskItem}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3 style={{ margin: 0, color: '#333' }}>{t.text}</h3>
                  <span style={styles.miniStreak}>🔥 {streak}</span>
                </div>
                
                <div style={styles.gridContainer}>
                  {last7Days.map(date => (
                    <div key={date} title={date} style={{ ...styles.gridSquare, backgroundColor: t.completedDates?.includes(date) ? '#10b981' : '#e5e7eb' }} />
                  ))}
                  <span style={{ fontSize: '0.7rem', color: '#999' }}>7d view</span>
                </div>

                <div style={{ marginTop: '15px', width: '100%', maxWidth: '400px' }}>
                  <CalendarHeatmap
                    startDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
                    endDate={new Date()}
                    values={t.completedDates?.map(d => ({ date: d, count: 1 })) || []}
                    classForValue={(value) => value ? 'color-filled' : 'color-empty'}
                  />
                  <style>{`.react-calendar-heatmap .color-filled { fill: #10b981; } .react-calendar-heatmap .color-empty { fill: #e5e7eb; } .react-calendar-heatmap { border: none !important; }`}</style>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
  {/* THIS IS THE FIX: Individual Toggle */}
  <button 
    onClick={() => axios.put(`http://localhost:5000/tasks/${t._id}/toggle`).then(fetchTasks())} 
    style={{ 
      ...styles.actionBtn, 
      backgroundColor: isDoneToday ? '#10b981' : '#fff', 
      color: isDoneToday ? '#fff' : '#10b981' 
    }}
  >
    {isDoneToday ? '✓ Done' : 'Check'}
  </button>

  {/* THIS IS THE FIX: Individual Delete */}
  <button 
    onClick={() => axios.delete(`http://localhost:5000/tasks/${t._id}`).then(fetchTasks())} 
    style={styles.delBtn}
  >
    ✕
  </button>
</div>

            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- 4. MAIN APP ---
export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  return (
    <Router>
      <Background />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/vault" element={token ? <Vault setToken={setToken} /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

// --- 5. STYLES ---
const styles = {
  canvas: { height: '100vh', width: '100vw', background: 'linear-gradient(to bottom, #edfffa 0%, #31c5d6 100%)', position: 'fixed', top: 0, left: 0, zIndex: -1, overflow: 'hidden' },
  bubble: { borderRadius: '100%', opacity: 0.8, position: 'absolute', background: 'radial-gradient(ellipse at top right, #b8c6c6 0%, #30b3d3 46%, #20628c 100%)', animationName: 'moveBubble', animationIterationCount: 'infinite', animationTimingFunction: 'linear' },
  authPage: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  authCard: { padding: '40px', backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', textAlign: 'center', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '20px' },
  title: { color: '#1a202c', fontSize: '1.8rem', margin: 0, fontWeight: 'bold' },
  linkText: { color: '#4a5568', fontSize: '0.9rem', marginTop: '10px' },
  input: { padding: '14px', borderRadius: '10px', border: '1px solid #cbd5e0', outline: 'none', width: '100%', boxSizing: 'border-box', backgroundColor: '#fff', color: '#333' },
  btnPrimary: { padding: '14px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', width: '100%' },
  container: { padding: '60px 40px', minHeight: '100vh', fontFamily: 'Inter, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '700px', margin: '0 auto 30px' },
  inputArea: { marginBottom: '30px', display: 'flex', justifyContent: 'center', maxWidth: '700px', margin: '0 auto' },
  taskInput: { padding: '14px', width: '100%', borderRadius: '12px 0 0 12px', border: '1px solid #ccc', backgroundColor: '#fff', color: '#333' },
  btnAdd: { padding: '0 25px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '0 12px 12px 0', cursor: 'pointer', fontWeight: 'bold' },
  taskList: { maxWidth: '700px', margin: '0 auto' },
  taskItem: { display: 'flex', backgroundColor: 'rgba(255,255,255,0.9)', padding: '20px', marginBottom: '15px', borderRadius: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', alignItems: 'center', gap: '15px' },
  miniStreak: { backgroundColor: '#fff7ed', color: '#ea580c', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' },
  gridContainer: { display: 'flex', gap: '4px', marginTop: '8px', alignItems: 'center' },
  gridSquare: { width: '12px', height: '12px', borderRadius: '2px' },
  actionBtn: { border: '2px solid #10b981', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  delBtn: { background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '1.2rem' },
  btnDanger: { backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }
};
