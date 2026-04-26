// ══════════════════════════════
//  PracticalVault — app.js
// ══════════════════════════════

let practicals = JSON.parse(localStorage.getItem('pvault') || '[]');
let editingId  = null;
let viewingId  = null;
let currentView = 'all';

const $ = id => document.getElementById(id);
const rand = () => Math.random().toString(36).slice(2, 10);

// ── Language → file extension map
const EXT = {
  Python:'py', C:'c', 'C++':'cpp', Java:'java',
  JavaScript:'js', 'HTML/CSS':'html', SQL:'sql', Other:'txt'
};

function getLangClass(lang) {
  const map = { Python:'l-Python', C:'l-C', 'C++':'l-C\\+\\+', Java:'l-Java',
    JavaScript:'l-JavaScript', 'HTML/CSS':'l-HTMLCSS', SQL:'l-SQL', Other:'l-Other' };
  return map[lang] || 'l-Other';
}

function getLinkLabel(url) {
  try {
    const h = new URL(url).hostname.replace('www.','');
    if (h.includes('replit'))    return '🔁 Replit';
    if (h.includes('codepen'))   return '✏️ CodePen';
    if (h.includes('github'))    return '🐙 GitHub';
    if (h.includes('drive'))     return '📁 Drive';
    if (h.includes('netlify'))   return '🌐 Netlify';
    if (h.includes('vercel'))    return '▲ Vercel';
    if (h.includes('glitch'))    return '🎏 Glitch';
    return '🔗 ' + h.split('.')[0];
  } catch { return '🔗 Link'; }
}

function save() { localStorage.setItem('pvault', JSON.stringify(practicals)); }

function showToast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2600);
}

function escHtml(t='') {
  return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ══════════════════════════════
//  STATS
// ══════════════════════════════
function renderStats() {
  $('statTotal').textContent    = practicals.length;
  $('statLinks').textContent    = practicals.reduce((a,p)=>a+(p.links||[]).length,0);
  $('statDL').textContent       = practicals.filter(p=>p.download).length;
  $('statLangs').textContent    = new Set(practicals.map(p=>p.lang)).size;
  $('sTotal').textContent       = practicals.length;
  $('sLinks').textContent       = practicals.reduce((a,p)=>a+(p.links||[]).length,0);
  $('sLangs').textContent       = new Set(practicals.map(p=>p.lang)).size;
}

// ══════════════════════════════
//  FILTER HELPER
// ══════════════════════════════
function filtered() {
  const q    = $('searchInput').value.toLowerCase();
  const lang = $('langFilter').value;
  return practicals.filter(p => {
    const mQ   = !q || [p.title,p.subject,p.aim].some(f=>(f||'').toLowerCase().includes(q));
    const mL   = !lang || p.lang === lang;
    return mQ && mL;
  }).sort((a,b)=>(+a.no||0)-(+b.no||0));
}

// ══════════════════════════════
//  CARD HTML
// ══════════════════════════════
function cardHTML(p, i) {
  const links = (p.links||[]).slice(0,3);
  return `
  <div class="card" style="animation-delay:${i*0.05}s">
    <div class="card-top">
      <span class="card-num">#${p.no||'?'}</span>
      <span class="lang-badge ${getLangClass(p.lang)}">${p.lang||'Other'}</span>
    </div>
    <div>
      <div class="card-title">${escHtml(p.title)||'Untitled'}</div>
      ${p.subject?`<div class="card-subject">${escHtml(p.subject)}</div>`:''}
    </div>
    ${p.aim?`<div class="card-aim">${escHtml(p.aim)}</div>`:''}
    ${links.length?`
    <div class="card-links">
      ${links.map(l=>`<a href="${l}" target="_blank" class="link-chip">
        <i class="fa fa-arrow-up-right-from-square"></i>${getLinkLabel(l)}</a>`).join('')}
      ${(p.links||[]).length>3?`<span class="link-chip">+${p.links.length-3}</span>`:''}
    </div>`:''}
    <div class="card-actions">
      <button class="cta cta-view" onclick="openView('${p.id}')">👁️ View</button>
      <button class="cta cta-code ${p.code?'':'disabled'}" onclick="downloadCode('${p.id}')">
        <i class="fa fa-code"></i> Code</button>
    </div>
    <div class="card-actions2">
      ${p.download
        ?`<a class="cta cta-dl" href="${p.download}" target="_blank"><i class="fa fa-download"></i>Download</a>`
        :`<span class="cta cta-dl disabled"><i class="fa fa-download"></i>Download</span>`}
      <button class="cta cta-pdf" onclick="exportPDF('${p.id}')"><i class="fa fa-file-pdf"></i>PDF</button>
      <button class="cta cta-share" onclick="sharePractical('${p.id}')"><i class="fa fa-share-nodes"></i>Share</button>
    </div>
  </div>`;
}

// ══════════════════════════════
//  RENDER VIEWS
// ══════════════════════════════
function renderAll() {
  const list = filtered();
  const grid = $('cardsGrid');
  if (!list.length) { grid.innerHTML=''; $('emptyState').style.display='block'; return; }
  $('emptyState').style.display='none';
  grid.innerHTML = list.map((p,i) => cardHTML(p,i)).join('');
}

function renderOutputs() {
  const list = filtered().filter(p=>p.links&&p.links.length);
  const grid = $('outputsGrid');
  if (!list.length) { grid.innerHTML=''; $('emptyOutputs').style.display='block'; return; }
  $('emptyOutputs').style.display='none';
  grid.innerHTML = list.map((p,i)=>cardHTML(p,i)).join('');
}

function renderDownloads() {
  const list = filtered().filter(p=>p.download);
  const dl   = $('dlList');
  if (!list.length) { dl.innerHTML=''; $('emptyDL').style.display='block'; return; }
  $('emptyDL').style.display='none';
  dl.innerHTML = list.map((p,i)=>`
    <div class="dl-card" style="animation-delay:${i*0.05}s">
      <div class="dl-num">#${p.no||'?'}</div>
      <div class="dl-info">
        <div class="dl-title">${escHtml(p.title)}</div>
        <div class="dl-sub">${escHtml(p.subject||'')} · <span class="lang-badge ${getLangClass(p.lang)}">${p.lang}</span></div>
      </div>
      <a class="dl-link" href="${p.download}" target="_blank">
        <i class="fa fa-download"></i> Download
      </a>
    </div>`).join('');
}

function renderIndex() {
  const list = filtered();
  const tbody = $('indexBody');
  if (!list.length) { tbody.innerHTML=`<tr><td colspan="8" style="text-align:center;padding:30px;color:var(--muted)">No practicals found.</td></tr>`; return; }
  tbody.innerHTML = list.map((p,i)=>`
    <tr>
      <td><span class="sr-num">${p.no||i+1}</span></td>
      <td style="font-weight:700;max-width:180px">${escHtml(p.title)}</td>
      <td style="color:var(--muted);font-size:0.8rem">${escHtml(p.subject||'—')}</td>
      <td><span class="lang-badge ${getLangClass(p.lang)}">${p.lang}</span></td>
      <td>
        ${(p.links||[]).length
          ?`<div class="tbl-links">${p.links.map(l=>`<a href="${l}" target="_blank" class="tbl-link"><i class="fa fa-arrow-up-right-from-square"></i>${getLinkLabel(l)}</a>`).join('')}</div>`
          :`<span class="no-badge">None</span>`}
      </td>
      <td><span class="${p.code?'has-badge':'no-badge'}">${p.code?'✓ Yes':'—'}</span></td>
      <td>
        ${p.download
          ?`<a href="${p.download}" target="_blank" class="tbl-btn dl"><i class="fa fa-download"></i> DL</a>`
          :`<span class="no-badge">—</span>`}
      </td>
      <td>
        <div class="tbl-actions">
          <button class="tbl-btn" onclick="openView('${p.id}')">👁️ View</button>
          ${p.code?`<button class="tbl-btn dl" onclick="downloadCode('${p.id}')">⬇ Code</button>`:''}
          <button class="tbl-btn" onclick="exportPDF('${p.id}')">📄 PDF</button>
        </div>
      </td>
    </tr>`).join('');
}

function render() {
  renderStats();
  if (currentView==='all')       renderAll();
  if (currentView==='index')     renderIndex();
  if (currentView==='outputs')   renderOutputs();
  if (currentView==='downloads') renderDownloads();
}

// ══════════════════════════════
//  DOWNLOAD CODE FILE
// ══════════════════════════════
function downloadCode(id) {
  const p = practicals.find(x=>x.id===id);
  if (!p||!p.code) { showToast('No code saved for this practical.'); return; }
  const ext  = EXT[p.lang] || 'txt';
  const name = `Practical_${p.no||p.id}_${(p.title||'code').replace(/\s+/g,'_')}.${ext}`;
  const blob = new Blob([p.code], { type: 'text/plain' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
  showToast(`✅ Code downloaded as ${name}`);
}

// ══════════════════════════════
//  EXPORT SINGLE PDF
// ══════════════════════════════
function exportPDF(id) {
  const p = practicals.find(x=>x.id===id);
  if (!p) return;
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit:'mm', format:'a4' });
  const W = 210, M = 15, TW = W - M*2;
  let y = 20;

  // Header bar
  doc.setFillColor(109,40,217);
  doc.rect(0,0,W,14,'F');
  doc.setTextColor(255,255,255);
  doc.setFont('helvetica','bold');
  doc.setFontSize(11);
  doc.text('⚗️  PracticalVault — Exam Record', M, 9.5);
  doc.setFont('helvetica','normal');
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, W-M, 9.5, {align:'right'});

  y = 24;
  // Title
  doc.setTextColor(20,20,40);
  doc.setFont('helvetica','bold');
  doc.setFontSize(16);
  const titleLines = doc.splitTextToSize(`Practical #${p.no||'?'}: ${p.title}`, TW);
  doc.text(titleLines, M, y);
  y += titleLines.length * 7 + 2;

  // Meta pills
  doc.setFontSize(9);
  doc.setFont('helvetica','normal');
  doc.setTextColor(100,100,120);
  const meta = [p.lang, p.subject, p.date].filter(Boolean).join('   |   ');
  doc.text(meta, M, y);
  y += 8;

  // Divider
  doc.setDrawColor(200,200,215);
  doc.line(M, y, W-M, y);
  y += 7;

  // Aim
  if (p.aim) {
    doc.setFont('helvetica','bold'); doc.setFontSize(10); doc.setTextColor(60,60,80);
    doc.text('Aim', M, y); y += 5;
    doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.setTextColor(80,80,100);
    const aimLines = doc.splitTextToSize(p.aim, TW);
    doc.text(aimLines, M, y);
    y += aimLines.length * 5 + 6;
  }

  // Output Links
  if ((p.links||[]).length) {
    doc.setFont('helvetica','bold'); doc.setFontSize(10); doc.setTextColor(60,60,80);
    doc.text('Output / Demo Links', M, y); y += 5;
    doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.setTextColor(14,130,200);
    p.links.forEach(l => { doc.text('• ' + l, M+3, y); y += 5; });
    y += 3;
  }

  // Download
  if (p.download) {
    doc.setFont('helvetica','bold'); doc.setFontSize(10); doc.setTextColor(60,60,80);
    doc.text('Download Link', M, y); y += 5;
    doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.setTextColor(14,130,200);
    doc.text('• ' + p.download, M+3, y); y += 8;
  }

  // Code
  if (p.code) {
    doc.setFont('helvetica','bold'); doc.setFontSize(10); doc.setTextColor(60,60,80);
    doc.text('Code', M, y); y += 5;
    doc.setFillColor(240,242,250);
    const codeLines = doc.splitTextToSize(p.code, TW-6);
    const blockH = codeLines.length * 4.5 + 8;
    // new page if needed
    if (y + blockH > 280) { doc.addPage(); y = 20; }
    doc.roundedRect(M, y, TW, blockH, 2, 2, 'F');
    doc.setFont('courier','normal');
    doc.setFontSize(8); doc.setTextColor(30,50,90);
    doc.text(codeLines, M+4, y+6);
    y += blockH + 6;
  }

  // Footer
  doc.setFillColor(240,242,250);
  doc.rect(0,287,W,10,'F');
  doc.setFont('helvetica','italic'); doc.setFontSize(7); doc.setTextColor(140,140,160);
  doc.text('Generated by PracticalVault  |  Open in browser from index.html', W/2, 293, {align:'center'});

  doc.save(`Practical_${p.no||p.id}_${(p.title||'paper').replace(/\s+/g,'_')}.pdf`);
  showToast('📄 PDF exported!');
}

// ══════════════════════════════
//  EXPORT INDEX PDF
// ══════════════════════════════
function exportIndexPDF() {
  const list = filtered();
  if (!list.length) { showToast('No practicals to export.'); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit:'mm', format:'a4', orientation:'landscape' });
  const W=297, M=12;
  let y=20;

  doc.setFillColor(109,40,217);
  doc.rect(0,0,W,14,'F');
  doc.setTextColor(255,255,255);
  doc.setFont('helvetica','bold'); doc.setFontSize(12);
  doc.text('⚗️  PracticalVault — Practical Index', M, 9.5);
  doc.setFont('helvetica','normal'); doc.setFontSize(8);
  doc.text(`Date: ${new Date().toLocaleDateString()}  |  Total: ${list.length} Practicals`, W-M, 9.5, {align:'right'});

  y=22;
  doc.setFont('helvetica','bold'); doc.setFontSize(14); doc.setTextColor(20,20,40);
  doc.text('Practical Index Table', M, y); y+=10;

  // Table headers
  const cols = [12,14,48,40,28,70,38,28];
  const headers = ['Sr.','No.','Title','Subject','Language','Output Links','Download','Code'];
  doc.setFillColor(230,225,255);
  doc.rect(M,y-5,W-M*2,8,'F');
  doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor(60,30,120);
  let x=M;
  headers.forEach((h,i)=>{ doc.text(h,x+2,y); x+=cols[i]; });
  y+=5;
  doc.setDrawColor(200,195,230); doc.line(M,y,W-M,y); y+=4;

  doc.setFont('helvetica','normal'); doc.setFontSize(7.5);
  list.forEach((p,idx)=>{
    if (y>190){ doc.addPage(); y=20; }
    const row = y+6;
    if (idx%2===0){ doc.setFillColor(248,247,255); doc.rect(M,y-1,W-M*2,9,'F'); }
    doc.setTextColor(30,30,50);
    x=M;
    const cells = [
      String(idx+1),
      String(p.no||'?'),
      (p.title||'').slice(0,28),
      (p.subject||'—').slice(0,20),
      p.lang||'Other',
      (p.links||[]).length ? p.links.map(l=>{try{return new URL(l).hostname.replace('www.','')}catch{return l}}).join(', ').slice(0,48) : '—',
      p.download ? '✓ Yes' : '—',
      p.code ? '✓ Yes' : '—'
    ];
    cells.forEach((c,i)=>{ doc.text(c, x+2, row); x+=cols[i]; });
    y+=9;
    doc.setDrawColor(225,220,245); doc.line(M,y-1,W-M,y-1);
  });

  doc.setFillColor(240,238,255);
  doc.rect(0,200,W,10,'F');
  doc.setFont('helvetica','italic'); doc.setFontSize(7); doc.setTextColor(140,140,160);
  doc.text('Generated by PracticalVault — Your Digital Practical Record', W/2, 206, {align:'center'});

  doc.save('PracticalVault_Index.pdf');
  showToast('📊 Index PDF exported!');
}

// ══════════════════════════════
//  PRINT INDEX
// ══════════════════════════════
function printIndex() {
  const list = filtered();
  const rows = list.map((p,i)=>`
    <tr>
      <td>${i+1}</td>
      <td>${p.no||'?'}</td>
      <td><strong>${escHtml(p.title)}</strong></td>
      <td>${escHtml(p.subject||'—')}</td>
      <td>${p.lang}</td>
      <td>${(p.links||[]).map(l=>`<a href="${l}">${l}</a>`).join('<br>') || '—'}</td>
      <td>${p.download?`<a href="${p.download}">Download</a>`:'—'}</td>
      <td>${p.code?'✓':'-'}</td>
    </tr>`).join('');

  const html = `<!DOCTYPE html><html><head><title>Practical Index</title>
  <style>
    body{font-family:Arial,sans-serif;padding:20px;font-size:11pt}
    h1{font-size:18pt;margin-bottom:4px}
    p{color:#666;margin-bottom:14px;font-size:9pt}
    table{width:100%;border-collapse:collapse;font-size:9pt}
    th{background:#6d28d9;color:#fff;padding:8px 10px;text-align:left}
    td{padding:7px 10px;border-bottom:1px solid #e2e8f0}
    tr:nth-child(even) td{background:#f8f7ff}
    a{color:#6d28d9}
    @media print{a{color:#000}}
  </style></head><body>
  <h1>⚗️ Practical Index</h1>
  <p>Total: ${list.length} practicals &nbsp;|&nbsp; Printed: ${new Date().toLocaleDateString()}</p>
  <table><thead><tr>
    <th>Sr.</th><th>No.</th><th>Title</th><th>Subject</th>
    <th>Language</th><th>Output Links</th><th>Download</th><th>Code</th>
  </tr></thead><tbody>${rows}</tbody></table>
  </body></html>`;

  const frame = $('printFrame');
  frame.srcdoc = html;
  frame.onload = () => { frame.contentWindow.print(); };
}

// ══════════════════════════════
//  SHARE
// ══════════════════════════════
function sharePractical(id) {
  const p = practicals.find(x=>x.id===id);
  if (!p) return;
  const text = `📋 Practical #${p.no}: ${p.title}\n📚 Subject: ${p.subject||'—'}\n💻 Language: ${p.lang}\n🎯 Aim: ${p.aim||'—'}\n${(p.links||[]).length?'\n🔗 Output Links:\n'+p.links.join('\n'):''}${p.download?'\n💾 Download: '+p.download:''}`;

  if (navigator.share) {
    navigator.share({ title: `Practical #${p.no}: ${p.title}`, text }).catch(()=>{});
  } else {
    navigator.clipboard.writeText(text).then(()=> showToast('📋 Copied to clipboard!'));
  }
}

// ══════════════════════════════
//  VIEW MODAL
// ══════════════════════════════
function openView(id) {
  viewingId = id;
  const p = practicals.find(x=>x.id===id);
  $('viewTitle').textContent = `#${p.no||'?'} — ${p.title}`;

  $('viewBody').innerHTML = `
    <div class="view-meta">
      <span class="lang-badge ${getLangClass(p.lang)}">${p.lang}</span>
      ${p.subject?`<span class="view-pill">${escHtml(p.subject)}</span>`:''}
      ${p.date?`<span class="view-pill">${p.date}</span>`:''}
    </div>
    ${p.aim?`<div class="view-section"><h4>Aim</h4><p>${escHtml(p.aim)}</p></div>`:''}
    ${(p.links||[]).length?`
    <div class="view-section"><h4>Output / Demo Links</h4>
      <div class="view-links">
        ${p.links.map(l=>`<a href="${l}" target="_blank" class="link-chip"><i class="fa fa-arrow-up-right-from-square"></i>${getLinkLabel(l)}</a>`).join('')}
      </div>
    </div>`:''}
    ${p.download?`<div class="view-section"><h4>Download</h4>
      <a href="${p.download}" target="_blank" class="view-dl-btn"><i class="fa fa-download"></i> Download Paper</a>
    </div>`:''}
    ${p.code?`<div class="view-section"><h4>Code (${p.lang})</h4>
      <div class="code-block">${escHtml(p.code)}</div>
    </div>`:''}`;

  $('viewFooter').innerHTML = `
    <button class="ftr-btn" onclick="openAddModal('${id}');$('viewOverlay').classList.remove('open')">✏️ Edit</button>
    ${p.code?`<button class="ftr-btn green" onclick="downloadCode('${id}')"><i class='fa fa-code'></i> Download Code</button>`:''}
    <button class="ftr-btn orange" onclick="exportPDF('${id}')"><i class='fa fa-file-pdf'></i> Export PDF</button>
    <button class="ftr-btn pink" onclick="sharePractical('${id}')"><i class='fa fa-share-nodes'></i> Share</button>
    <button class="btn-del" onclick="deletePractical('${id}')">🗑️ Delete</button>`;

  $('viewOverlay').classList.add('open');
}

function deletePractical(id) {
  if (!confirm('Delete this practical?')) return;
  practicals = practicals.filter(p=>p.id!==id);
  save(); $('viewOverlay').classList.remove('open'); render();
  showToast('🗑️ Practical deleted');
}

$('closeView').onclick = ()=> $('viewOverlay').classList.remove('open');
$('viewOverlay').onclick = e=>{ if(e.target===$('viewOverlay')) $('viewOverlay').classList.remove('open'); };

// ══════════════════════════════
//  ADD / EDIT MODAL
// ══════════════════════════════
function openAddModal(id) {
  editingId = id||null;
  $('modalTitle').textContent = id?'Edit Practical':'Add Practical';
  if (id) {
    const p = practicals.find(x=>x.id===id);
    $('fNo').value     = p.no||'';
    $('fTitle').value  = p.title||'';
    $('fSubject').value= p.subject||'';
    $('fLang').value   = p.lang||'Python';
    $('fAim').value    = p.aim||'';
    $('fLinks').value  = (p.links||[]).join('\n');
    $('fDownload').value= p.download||'';
    $('fCode').value   = p.code||'';
  } else {
    ['fNo','fTitle','fSubject','fAim','fLinks','fDownload','fCode'].forEach(f=>$(f).value='');
    $('fLang').value='Python';
  }
  $('modalOverlay').classList.add('open');
}

function closeModal() { $('modalOverlay').classList.remove('open'); editingId=null; }

$('openAddModal').onclick = ()=> openAddModal();
$('closeModal').onclick   = closeModal;
$('cancelModal').onclick  = closeModal;
$('modalOverlay').onclick = e=>{ if(e.target===$('modalOverlay')) closeModal(); };

$('saveBtn').onclick = ()=>{
  const title = $('fTitle').value.trim();
  if (!title) { showToast('⚠️ Title is required!'); return; }
  const links = $('fLinks').value.split('\n').map(l=>l.trim()).filter(Boolean);
  const data  = {
    no: parseInt($('fNo').value)||practicals.length+1,
    title, subject: $('fSubject').value.trim(),
    lang: $('fLang').value, aim: $('fAim').value.trim(),
    links, download: $('fDownload').value.trim(),
    code: $('fCode').value,
    date: new Date().toLocaleDateString()
  };
  if (editingId) {
    const i = practicals.findIndex(p=>p.id===editingId);
    practicals[i] = {...practicals[i], ...data};
    showToast('✅ Practical updated!');
  } else {
    practicals.push({id:rand(),...data});
    showToast('✅ Practical added!');
  }
  save(); closeModal(); render();
};

// ══════════════════════════════
//  NAV
// ══════════════════════════════
const viewLabels = { all:'All Papers', index:'Index Page', outputs:'Output Links', downloads:'Downloads' };
const viewSections = { all:'viewAll', index:'viewIndex', outputs:'viewOutputs', downloads:'viewDownloads' };

document.querySelectorAll('.nav-item').forEach(item=>{
  item.addEventListener('click', e=>{
    e.preventDefault();
    document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
    item.classList.add('active');
    currentView = item.dataset.view;
    $('topbarTitle').textContent = viewLabels[currentView]||'';
    Object.values(viewSections).forEach(v=>$(v).style.display='none');
    $(viewSections[currentView]).style.display='';
    render();
    if(window.innerWidth<=700) $('sidebar').classList.remove('open');
  });
});

$('searchInput').addEventListener('input', render);
$('langFilter').addEventListener('change', render);
$('hamburger').onclick = ()=>$('sidebar').classList.toggle('open');
$('printAllBtn').onclick = ()=>{ currentView='index'; render(); printIndex(); };

// ══════════════════════════════
//  SAMPLE DATA
// ══════════════════════════════
if (!practicals.length) {
  practicals = [
    { id:rand(), no:1, title:'Bubble Sort Implementation', subject:'Data Structures', lang:'Python',
      aim:'To implement bubble sort algorithm and analyze its time complexity.',
      links:['https://replit.com/@example/bubblesort'], download:'',
      code:`def bubble_sort(arr):\n    n = len(arr)\n    for i in range(n):\n        for j in range(0, n-i-1):\n            if arr[j] > arr[j+1]:\n                arr[j], arr[j+1] = arr[j+1], arr[j]\n    return arr\n\nprint(bubble_sort([64, 34, 25, 12, 22, 11, 90]))`,
      date:new Date().toLocaleDateString() },
    { id:rand(), no:2, title:'Student Database CRUD', subject:'DBMS', lang:'SQL',
      aim:'Create and manage a student database with CRUD operations.',
      links:[], download:'https://drive.google.com/example',
      code:`CREATE TABLE students (\n  id INT PRIMARY KEY AUTO_INCREMENT,\n  name VARCHAR(100),\n  roll_no VARCHAR(20),\n  marks FLOAT\n);\nINSERT INTO students VALUES (NULL, 'Alice', 'S001', 95.5);`,
      date:new Date().toLocaleDateString() },
    { id:rand(), no:3, title:'Simple Calculator', subject:'Programming Fundamentals', lang:'C',
      aim:'Build a simple calculator using switch-case to perform arithmetic operations.',
      links:['https://codepen.io/example/calc'], download:'https://drive.google.com/calc-paper',
      code:`#include<stdio.h>\nint main(){\n  float a,b; char op;\n  printf("Enter: "); scanf("%f %c %f",&a,&op,&b);\n  switch(op){\n    case '+': printf("%.2f",a+b); break;\n    case '-': printf("%.2f",a-b); break;\n    case '*': printf("%.2f",a*b); break;\n    case '/': b?printf("%.2f",a/b):printf("Err"); break;\n  }\n}`,
      date:new Date().toLocaleDateString() },
    { id:rand(), no:4, title:'Linked List Operations', subject:'Data Structures', lang:'C++',
      aim:'Implement singly linked list with insert, delete and display operations.',
      links:['https://github.com/example/linked-list'], download:'',
      code:`#include<iostream>\nusing namespace std;\nstruct Node{ int data; Node* next; };\nNode* head=NULL;\nvoid insert(int d){\n  Node* n=new Node(); n->data=d; n->next=head; head=n;\n}\nvoid display(){\n  Node* t=head;\n  while(t){ cout<<t->data<<" "; t=t->next; }\n}`,
      date:new Date().toLocaleDateString() },
  ];
  save();
}

render();
