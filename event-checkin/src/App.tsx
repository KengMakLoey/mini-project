import { useState, useEffect } from 'react';
import { Search, Users, CheckCircle, Clock, UserCheck, Trash2 } from 'lucide-react';
import './App.css';

interface Attendee {
  id: number;
  firstName: string;
  lastName: string;
  code: string;
  checkedIn: boolean;
  checkInTime: string | null;
}

function App() {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newAttendee, setNewAttendee] = useState({ firstName: '', lastName: '', code: '' });

  useEffect(() => {
    const saved = localStorage.getItem('eventAttendees');
    if (saved) {
      setAttendees(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('eventAttendees', JSON.stringify(attendees));
  }, [attendees]);

  const filteredAttendees = attendees.filter(a =>
    a.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: attendees.length,
    checkedIn: attendees.filter(a => a.checkedIn).length,
    pending: attendees.filter(a => !a.checkedIn).length
  };

  const handleRegister = () => {
    if (!newAttendee.firstName || !newAttendee.lastName || !newAttendee.code) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    if (newAttendee.code.length !== 9) {
      alert('รหัสต้องมี 9 ตัวเท่านั้น');
      return;
    }

    const codeExists = attendees.some(a => a.code === newAttendee.code);
    if (codeExists) {
      alert('รหัสนี้มีอยู่ในระบบแล้ว');
      return;
    }

    const now = new Date();
    const timeString = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

    const newId = attendees.length > 0 ? Math.max(...attendees.map(a => a.id)) + 1 : 1;
    setAttendees(prev => [...prev, {
      id: newId,
      firstName: newAttendee.firstName,
      lastName: newAttendee.lastName,
      code: newAttendee.code,
      checkedIn: true,
      checkInTime: timeString
    }]);

    setNewAttendee({ firstName: '', lastName: '', code: '' });
  };

  const handleDelete = (id: number) => {
    if (confirm('ต้องการลบผู้เข้าร่วมนี้หรือไม่?')) {
      setAttendees(prev => prev.filter(a => a.id !== id));
    }
  };

  return (
    <div className="app">
      <div className="container-split">
        {/* Left Side - Registration Form */}
        <div className="left-panel">
          <div className="form-card">
            <h1>ลงทะเบียนเข้างาน</h1>
            <p className="subtitle">กรอกข้อมูลเพื่อเช็คอินอัตโนมัติ</p>

            <div className="form-section">
              <div className="form-group">
                <label>ชื่อ</label>
                <input
                  type="text"
                  value={newAttendee.firstName}
                  onChange={(e) => setNewAttendee({...newAttendee, firstName: e.target.value})}
                  placeholder="กรอกชื่อ"
                  onKeyPress={(e) => e.key === 'Enter' && handleRegister()}
                />
              </div>

              <div className="form-group">
                <label>นามสกุล</label>
                <input
                  type="text"
                  value={newAttendee.lastName}
                  onChange={(e) => setNewAttendee({...newAttendee, lastName: e.target.value})}
                  placeholder="กรอกนามสกุล"
                  onKeyPress={(e) => e.key === 'Enter' && handleRegister()}
                />
              </div>

              <div className="form-group">
                <label>รหัส (9 ตัว)</label>
                <input
                  type="text"
                  value={newAttendee.code}
                  onChange={(e) => setNewAttendee({...newAttendee, code: e.target.value})}
                  placeholder="เช่น 660610999"
                  maxLength={9}
                  onKeyPress={(e) => e.key === 'Enter' && handleRegister()}
                />
                {newAttendee.code && newAttendee.code.length !== 9 && (
                  <span style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px', display: 'block' }}>
                    รหัสต้องมี 9 ตัว (ปัจจุบัน {newAttendee.code.length} ตัว)
                  </span>
                )}
              </div>

              <button onClick={handleRegister} className="btn-submit">
                <UserCheck size={20} />
                เช็คอิน
              </button>
            </div>

            {/* Stats in Left Panel */}
            <div className="stats-section">
              <div className="stats-mini">
                <div className="stat-item green">
                  <CheckCircle size={24} />
                  <div>
                    <span className="stat-label">เข้าร่วมแล้ว</span>
                    <span className="stat-value">{stats.checkedIn}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Attendee List */}
        <div className="right-panel">
          <div className="list-header">
            <h2>รายชื่อผู้เข้าร่วม</h2>
            
            {/* Search */}
            <div className="search-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="ค้นหาชื่อ, นามสกุล หรือรหัส..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="attendee-list">
            {filteredAttendees.length === 0 ? (
              <div className="empty-state">
                {attendees.length === 0 
                  ? 'ยังไม่มีผู้เข้าร่วม กรอกข้อมูลด้านซ้ายเพื่อเริ่มต้น' 
                  : 'ไม่พบข้อมูลที่ค้นหา'}
              </div>
            ) : (
              filteredAttendees.map((attendee) => (
                <div key={attendee.id} className="attendee-card">
                  <div className="attendee-info">
                    <div className="avatar">
                      <span>{attendee.firstName[0]}{attendee.lastName[0]}</span>
                    </div>
                    <div className="attendee-details">
                      <h4>{attendee.firstName} {attendee.lastName}</h4>
                      <p className="code">รหัส: {attendee.code}</p>
                      {attendee.checkedIn && (
                        <div className="check-in-badge">
                          <CheckCircle size={14} />
                          <span>เข้าร่วมเมื่อ {attendee.checkInTime}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(attendee.id)}
                    className="btn-delete"
                    title="ลบ"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;