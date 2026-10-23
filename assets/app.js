/* =========================================================
   BIBLIOTHECA — core data layer & shared helpers
   Storage: localStorage (self-contained, no server required)
   ========================================================= */

const DB_KEYS = {
  books: 'biblio_books',
  members: 'biblio_members',
  loans: 'biblio_loans',
  users: 'biblio_users',
  session: 'biblio_session',
  seeded: 'biblio_seeded_v1'
};

/* ---------- generic storage helpers ---------- */
function readDB(key){
  try{ return JSON.parse(localStorage.getItem(key)) || []; }
  catch(e){ return []; }
}
function writeDB(key, data){ localStorage.setItem(key, JSON.stringify(data)); }
function uid(prefix){ return prefix + '-' + Math.random().toString(36).slice(2,8).toUpperCase(); }
function todayISO(){ return new Date().toISOString().slice(0,10); }
function addDays(iso, days){
  const d = new Date(iso); d.setDate(d.getDate()+days);
  return d.toISOString().slice(0,10);
}
function fmtDate(iso){
  if(!iso) return '—';
  const d = new Date(iso+'T00:00:00');
  return d.toLocaleDateString('en-US',{ month:'short', day:'2-digit', year:'numeric' });
}
function daysBetween(a,b){
  return Math.round((new Date(b) - new Date(a)) / 86400000);
}

/* ---------- seed data (first run only) ---------- */
function seedIfNeeded(){
  if(localStorage.getItem(DB_KEYS.seeded)) return;

  const users = [
    { username:'admin', password:'admin123', name:'Eleanor Whitfield', role:'Librarian' }
  ];

  const books = [
    { id: uid('BK'), title:'The Midnight Library', author:'Matt Haig', isbn:'978-0525559474', genre:'Fiction', copies:4, available:2, shelf:'F-12', year:2020, rating:4.5 },
    { id: uid('BK'), title:'Sapiens: A Brief History of Humankind', author:'Yuval Noah Harari', isbn:'978-0062316097', genre:'History', copies:3, available:1, shelf:'H-04', year:2015, rating:4.7 },
    { id: uid('BK'), title:'Atomic Habits', author:'James Clear', isbn:'978-0735211292', genre:'Self-Help', copies:5, available:5, shelf:'S-21', year:2018, rating:4.8 },
    { id: uid('BK'), title:'Dune', author:'Frank Herbert', isbn:'978-0441013593', genre:'Sci-Fi', copies:3, available:0, shelf:'SF-01', year:1965, rating:4.9 },
    { id: uid('BK'), title:'The Silent Patient', author:'Alex Michaelides', isbn:'978-1250301697', genre:'Thriller', copies:2, available:1, shelf:'T-09', year:2019, rating:4.3 },
    { id: uid('BK'), title:'Educated', author:'Tara Westover', isbn:'978-0399590504', genre:'Memoir', copies:3, available:2, shelf:'M-06', year:2018, rating:4.6 },
    { id: uid('BK'), title:'Clean Code', author:'Robert C. Martin', isbn:'978-0132350884', genre:'Technology', copies:2, available:0, shelf:'TC-03', year:2008, rating:4.4 },
    { id: uid('BK'), title:'The Alchemist', author:'Paulo Coelho', isbn:'978-0062315007', genre:'Fiction', copies:6, available:4, shelf:'F-02', year:1988, rating:4.5 },
    { id: uid('BK'), title:'A Brief History of Time', author:'Stephen Hawking', isbn:'978-0553380163', genre:'Science', copies:2, available:1, shelf:'SC-11', year:1988, rating:4.6 },
    { id: uid('BK'), title:'Gone Girl', author:'Gillian Flynn', isbn:'978-0307588371', genre:'Thriller', copies:3, available:2, shelf:'T-14', year:2012, rating:4.2 },
  ];

  const members = [
    { id: uid('MB'), name:'Aditya Sharma', email:'aditya.sharma@example.com', phone:'98100-22334', joined:'2024-02-11', status:'Active', membership:'Annual' },
    { id: uid('MB'), name:'Priya Nair', email:'priya.nair@example.com', phone:'99887-11002', joined:'2023-11-04', status:'Active', membership:'Annual' },
    { id: uid('MB'), name:'Rahul Verma', email:'rahul.verma@example.com', phone:'97123-88010', joined:'2025-01-19', status:'Active', membership:'Monthly' },
    { id: uid('MB'), name:'Sana Khan', email:'sana.khan@example.com', phone:'96543-22781', joined:'2024-07-30', status:'Suspended', membership:'Annual' },
    { id: uid('MB'), name:'Vikram Patel', email:'vikram.patel@example.com', phone:'98765-43210', joined:'2025-03-02', status:'Active', membership:'Monthly' },
  ];

  writeDB(DB_KEYS.users, users);
  writeDB(DB_KEYS.books, books);
  writeDB(DB_KEYS.members, members);

  // loans referencing seeded books/members
  const loans = [
    { id: uid('LN'), bookId: books[1].id, memberId: members[0].id, issueDate:'2026-06-20', dueDate:'2026-07-04', returnDate:null, status:'Issued' },
    { id: uid('LN'), bookId: books[3].id, memberId: members[2].id, issueDate:'2026-06-15', dueDate:'2026-06-29', returnDate:null, status:'Issued' },
    { id: uid('LN'), bookId: books[6].id, memberId: members[4].id, issueDate:'2026-06-10', dueDate:'2026-06-24', returnDate:null, status:'Issued' },
    { id: uid('LN'), bookId: books[0].id, memberId: members[1].id, issueDate:'2026-05-01', dueDate:'2026-05-15', returnDate:'2026-05-14', status:'Returned' },
    { id: uid('LN'), bookId: books[4].id, memberId: members[3].id, issueDate:'2026-06-01', dueDate:'2026-06-15', returnDate:null, status:'Issued' },
  ];
  writeDB(DB_KEYS.loans, loans);
  localStorage.setItem(DB_KEYS.seeded, '1');
}
seedIfNeeded();

/* refresh overdue status based on today's date */
function refreshLoanStatuses(){
  const loans = readDB(DB_KEYS.loans);
  const today = todayISO();
  let changed = false;
  loans.forEach(l=>{
    if(l.status === 'Issued' && l.dueDate < today){
      l.status = 'Overdue'; changed = true;
    }
  });
  if(changed) writeDB(DB_KEYS.loans, loans);
  return loans;
}

/* ---------- auth ---------- */
function currentSession(){
  try{ return JSON.parse(sessionStorage.getItem(DB_KEYS.session)); }
  catch(e){ return null; }
}
function requireAuth(){
  const s = currentSession();
  if(!s){ window.location.href = 'index.html'; }
  return s;
}
function logout(){
  sessionStorage.removeItem(DB_KEYS.session);
  window.location.href = 'index.html';
}

/* ---------- shared UI: toast ---------- */
function toast(msg){
  let el = document.getElementById('toast');
  if(!el){
    el = document.createElement('div');
    el.id = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(()=> el.classList.remove('show'), 2600);
}

/* ---------- shared UI: modal ---------- */
function openModal(id){ document.getElementById(id).classList.add('open'); }
function closeModal(id){ document.getElementById(id).classList.remove('open'); }

/* ---------- render shell (sidebar) into any page ---------- */
function renderShell(activePage){
  const s = currentSession();
  const shellEl = document.getElementById('shell');
  if(!shellEl) return;

  const tabs = [
    { key:'dashboard', href:'dashboard.html', label:'Dashboard', idx:'01' },
    { key:'books', href:'books.html', label:'Catalog', idx:'02' },
    { key:'members', href:'members.html', label:'Members', idx:'03' },
    { key:'transactions', href:'transactions.html', label:'Circulation', idx:'04' },
    { key:'reports', href:'reports.html', label:'Reports', idx:'05' },
  ];

  shellEl.innerHTML = `
    <nav class="drawer-nav">
      <div class="brand">
        <div class="mark">Bibliotheca</div>
        <div class="sub">Card Catalog System</div>
      </div>
      <div class="drawer-tabs">
        ${tabs.map(t => `
          <a href="${t.href}" class="${t.key===activePage?'active':''}">
            <span class="tab-index">${t.idx}</span> ${t.label}
          </a>`).join('')}
      </div>
      <div class="drawer-foot">
        <div class="who">${s ? s.name : ''}</div>
        <div class="role">${s ? s.role : ''}</div>
        <a href="#" class="logout-link" onclick="logout();return false;">Sign out ↦</a>
      </div>
    </nav>
    <main class="main" id="main-content"></main>
  `;
}

/* ---------- ledger bar (top) ---------- */
function renderLedgerBar(){
  const bar = document.getElementById('ledger-bar');
  if(!bar) return;
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US',{ weekday:'short', month:'short', day:'2-digit', year:'numeric'});
  bar.innerHTML = `<div>Bibliotheca <span class="dot">·</span> Reading Room Ledger</div><div>${dateStr}</div>`;
}
