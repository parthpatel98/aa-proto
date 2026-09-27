import React, { useState } from 'react';
import { MarkLogo } from '../icons';
import { USERS } from '../data';
import { User } from '../types';

interface LoginProps {
  onSignIn: (user: User) => void;
  isOpen: boolean;
}

export const Login: React.FC<LoginProps> = ({ onSignIn, isOpen }) => {
  const [email, setEmail] = useState('bhoomi.barot@hiddenbrains.in');
  const [selectedUser, setSelectedUser] = useState(() => {
    try { return localStorage.getItem('aa-user') || 'Malin Andersson'; } catch { return 'Malin Andersson'; }
  });
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [emailErr, setEmailErr] = useState('');
  const [pwErr, setPwErr] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      document.body.classList.add('locked');
      document.documentElement.classList.add('locked');
      return () => {
        document.body.classList.remove('locked');
        document.documentElement.classList.remove('locked');
      };
    } else {
      document.body.classList.remove('locked');
      document.documentElement.classList.remove('locked');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleForgot = (e: React.MouseEvent) => {
    e.preventDefault();
    const v = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      setEmailErr('Enter your email address first, then choose “Forgot password?”.');
      return;
    }
    setInfo('If an account exists for ' + v + ', a reset link is on its way. (Simulated in this prototype.)');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInfo('');
    const v = email.trim();
    let ok = true;
    if (!v) {
      setEmailErr('Enter your email address.');
      ok = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      setEmailErr('That doesn’t look like an email address.');
      ok = false;
    }
    if (!pw) {
      setPwErr('Enter your password.');
      ok = false;
    } else if (pw.length < 6) {
      setPwErr('Passwords are at least 6 characters.');
      ok = false;
    }
    if (!ok) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (remember) {
        try {
          localStorage.setItem('aa-session', v);
        } catch {
          // ignore
        }
      }
      onSignIn(USERS.find((user) => user.name === selectedUser) || USERS[0]);
    }, 600);
  };

  return (
    <div id="login" className="login" aria-hidden="false">
      <main className="stage">
        <section className="hero" aria-label="AA Logistik">
          <a className="logo" href="#" aria-label="AA Logistik — People. Transport. Solutions.">
            <MarkLogo inverted className="login-hero-logo" />
            <span className="word">
              <span className="tag">People. Transport. Solutions.</span>
            </span>
          </a>
          <h1>Smarter transport starts here</h1>
          <p className="lead">
            Intelligent email processing, faster order creation and smoother operations for a more connected supply chain.
          </p>
          <ul className="features">
            <li>
              <span className="ic">
                <svg viewBox="0 0 32 32" aria-hidden="true">
                  <rect x="4.5" y="7.5" width="23" height="17" rx="2.5" />
                  <path d="M5.5 9.5 16 18l10.5-8.5" />
                </svg>
              </span>
              <div>
                <h2>Automate intake</h2>
                <p>Automatically identify and extract transport requests from customer emails.</p>
              </div>
            </li>
            <li>
              <span className="ic">
                <svg viewBox="0 0 32 32" aria-hidden="true">
                  <path d="M8.5 4.5h10l6 6v17h-16z" />
                  <path d="M18 4.8V11h6.2" />
                  <path d="M12 16.5h8M12 20.5h8M12 24h5" />
                </svg>
              </span>
              <div>
                <h2>Reduce manual work</h2>
                <p>Validate, route and create transport orders with AI assistance.</p>
              </div>
            </li>
            <li>
              <span className="ic">
                <svg viewBox="0 0 32 32" aria-hidden="true">
                  <path d="M5 26.5h22" />
                  <path d="M8.5 25v-6M14.5 25v-9M20.5 25v-7" />
                  <path d="M6.5 14 13 8.5l4 3.5 8-6.5" />
                  <path d="M20 5.5h5.2V10.7" />
                </svg>
              </span>
              <div>
                <h2>Keep operations in control</h2>
                <p>Full visibility, human review and seamless integration with Opter.</p>
              </div>
            </li>
          </ul>
        </section>
        <section className="side">
          <div className="lcard">
            <a className="logo" href="#" aria-label="AA Logistik — People. Transport. Solutions.">
              <MarkLogo className="login-card-logo" />
              <span className="word">
                <span className="tag">People. Transport. Solutions.</span>
              </span>
            </a>
            <h2>Sign in to your account</h2>
            <p className="sub">Access the AA Logistik operations application</p>
            <form id="lgForm" noValidate onSubmit={handleSubmit}>
              <div className="fld">
                <label className="lb" htmlFor="lgRole">Demo role</label>
                <select id="lgRole" className="role-select" value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
                  {USERS.filter((user) => ['Malin Andersson', 'Niclause', 'Andreas Backström', 'Traffic Controller'].includes(user.name)).map((user) => (
                    <option key={user.name} value={user.name}>{user.name} — {user.role}</option>
                  ))}
                </select>
              </div>
              <div className="fld">
                <label className="lb" htmlFor="lgEmail">Email</label>
                <div className={`input ${emailErr ? 'bad' : ''}`} id="wEmail">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="3" y="5.5" width="18" height="13" rx="2" />
                    <path d="M4 7.5l8 6 8-6" />
                  </svg>
                  <input
                    id="lgEmail"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="username"
                    placeholder="name@aalogistik.se"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailErr('');
                    }}
                  />
                </div>
                {emailErr && <p className="err" role="alert">{emailErr}</p>}
              </div>
              <div className="fld">
                <label className="lb" htmlFor="lgPw">Password</label>
                <div className={`input ${pwErr ? 'bad' : ''}`} id="wPw">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
                    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
                    <path d="M12 14.5v2" />
                  </svg>
                  <input
                    id="lgPw"
                    name="password"
                    type={showPw ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={pw}
                    onChange={(e) => {
                      setPw(e.target.value);
                      setPwErr('');
                    }}
                  />
                  <button
                    className="eye"
                    id="lgEye"
                    type="button"
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                    aria-pressed={showPw}
                    onClick={() => setShowPw(!showPw)}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
                      <circle cx="12" cy="12" r="3" />
                      {showPw && <path id="eyeSlash" d="M4 4l16 16" />}
                    </svg>
                  </button>
                </div>
                {pwErr && <p className="err" role="alert">{pwErr}</p>}
              </div>
              <div className="lrow2">
                <label className="check">
                  <input
                    type="checkbox"
                    id="lgRemember"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <span className="box">
                    <svg viewBox="0 0 16 16" aria-hidden="true">
                      <path d="M3 8.5l3.2 3.2L13 4.8" />
                    </svg>
                  </span>
                  Remember me
                </label>
                <a className="link" href="#" id="lgForgot" onClick={handleForgot}>
                  Forgot password?
                </a>
              </div>
              {info && <p className="info" role="status">{info}</p>}
              <button className="submit" id="lgGo" type="submit" disabled={loading}>
                <span>{loading ? 'Signing in…' : 'Sign in'}</span>
              </button>
              <p className="demo">
                Prototype: any email address and a password of 6+ characters signs you in as the selected demo user.
              </p>
            </form>
            <div className="notice">
              <svg viewBox="0 0 32 32" aria-hidden="true">
                <path d="M16 3.5 26 7v8.2c0 6.2-4 10.5-10 13.3-6-2.8-10-7.1-10-13.3V7z" />
                <path d="M11.5 16l3.2 3.2 6-6.4" />
              </svg>
              <p>
                This application is for authorised AA Logistik users only.
                <br />
                Your data is protected and handled in accordance with applicable security and privacy policies.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
