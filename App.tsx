import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity, AlertCircle, ArrowRight, BarChart3, CheckCircle2, ChevronDown, CircleDot,
  ClipboardCheck, Clock3, Download, FileUp, Gauge, LayoutDashboard, Menu, Network,
  Plus, RadioTower, RotateCcw, Search, ShieldCheck, Trash2, X
} from 'lucide-react';
import {
  Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis
} from 'recharts';

type View = 'overview' | 'operations' | 'network' | 'tasks' | 'analytics';
type Priority = 'critical' | 'high' | 'normal';
type OperationStatus = 'active' | 'watch' | 'resolved';
type AssetStatus = 'online' | 'degraded' | 'offline';

type Operation = {
  id: string; title: string; sector: string; owner: string;
  priority: Priority; status: OperationStatus; created: string;
};
type Asset = { id: string; name: string; type: string; sector: string; status: AssetStatus; updated: string };
type Task = { id: string; title: string; priority: Priority; done: boolean };
type ActivityEntry = { id: string; description: string; created: string };
type Workspace = {
  version: 1; mode: 'sample' | 'local'; operations: Operation[];
  assets: Asset[]; tasks: Task[]; activity: ActivityEntry[];
};

const STORAGE_KEY = 'system-zero-tactical-workspace-v2';
const makeId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const ago = (hours: number) => new Date(Date.now() - hours * 3600000).toISOString();
const seed = (): Workspace => ({
  version: 1,
  mode: 'sample',
  operations: [
    { id: 'op-101', title: 'Perimeter readiness review', sector: 'North Sector', owner: 'Ops Team', priority: 'high', status: 'active', created: ago(0.7) },
    { id: 'op-102', title: 'Relay inspection', sector: 'East Sector', owner: 'Systems', priority: 'normal', status: 'watch', created: ago(2.5) },
    { id: 'op-103', title: 'Communications validation', sector: 'Central Hub', owner: 'Ops Team', priority: 'critical', status: 'active', created: ago(4) },
    { id: 'op-104', title: 'Infrastructure audit', sector: 'West Sector', owner: 'Engineering', priority: 'normal', status: 'resolved', created: ago(24) }
  ],
  assets: [
    { id: 'a-1', name: 'Gateway Alpha', type: 'Edge gateway', sector: 'Central Hub', status: 'online', updated: ago(0.3) },
    { id: 'a-2', name: 'Relay Delta', type: 'Communications', sector: 'East Sector', status: 'degraded', updated: ago(2) },
    { id: 'a-3', name: 'Field Console', type: 'Workstation', sector: 'North Sector', status: 'online', updated: ago(1) },
    { id: 'a-4', name: 'Archive Node', type: 'Storage', sector: 'West Sector', status: 'offline', updated: ago(7) }
  ],
  tasks: [
    { id: 't-1', title: 'Review active operation priorities', priority: 'high', done: false },
    { id: 't-2', title: 'Inspect degraded relay status', priority: 'critical', done: false },
    { id: 't-3', title: 'Reconcile the asset inventory', priority: 'normal', done: true },
    { id: 't-4', title: 'Prepare the next shift handoff', priority: 'normal', done: false }
  ],
  activity: [
    { id: 'e-1', description: 'Demo dataset initialized', created: ago(0.2) },
    { id: 'e-2', description: 'Relay Delta marked degraded (sample)', created: ago(2) },
    { id: 'e-3', description: 'Infrastructure audit resolved (sample)', created: ago(24) }
  ]
});

const priorities: Priority[] = ['normal', 'high', 'critical'];
const operationStatuses: OperationStatus[] = ['active', 'watch', 'resolved'];
const assetStatuses: AssetStatus[] = ['online', 'degraded', 'offline'];
const text = (v: unknown, max = 160) => typeof v === 'string' && v.length > 0 && v.length <= max;
const validWorkspace = (raw: unknown): raw is Workspace => {
  if (!raw || typeof raw !== 'object') return false;
  const v = raw as Record<string, unknown>;
  if (v.version !== 1 || !Array.isArray(v.operations) || !Array.isArray(v.assets) ||
      !Array.isArray(v.tasks) || !Array.isArray(v.activity)) return false;
  if ([v.operations, v.assets, v.tasks, v.activity].some((arr) => (arr as unknown[]).length > 300)) return false;
  return (v.operations as any[]).every(o => o && text(o.id) && text(o.title) && text(o.sector) && text(o.owner) &&
      priorities.includes(o.priority) && operationStatuses.includes(o.status) && text(o.created)) &&
    (v.assets as any[]).every(a => a && text(a.id) && text(a.name) && text(a.type) && text(a.sector) &&
      assetStatuses.includes(a.status) && text(a.updated)) &&
    (v.tasks as any[]).every(t => t && text(t.id) && text(t.title) && priorities.includes(t.priority) && typeof t.done === 'boolean') &&
    (v.activity as any[]).every(e => e && text(e.id) && text(e.description, 300) && text(e.created));
};
const loadWorkspace = (): Workspace => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const value: unknown = JSON.parse(stored);
      if (validWorkspace(value)) return { ...value, mode: 'local' };
    }
  } catch { /* local storage may be disabled */ }
  return seed();
};
const formatShort = (date: string) => {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? 'Unknown' :
    parsed.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};
const number = (n: number) => String(n).padStart(2, '0');
const pageCopy: Record<View, { eyebrow: string; title: string; description: string }> = {
  overview: { eyebrow: 'Command / 01', title: 'Command overview', description: 'Your operations workspace at a glance.' },
  operations: { eyebrow: 'Command / 02', title: 'Operations', description: 'Track workstreams, owners, and status changes.' },
  network: { eyebrow: 'Command / 03', title: 'Asset network', description: 'Maintain a manually updated asset status register.' },
  tasks: { eyebrow: 'Command / 04', title: 'Action board', description: 'Prioritize tasks and record completed work.' },
  analytics: { eyebrow: 'Command / 05', title: 'Analytics', description: 'Charts calculated from this browser’s workspace data.' }
};
const navigation: { id: View; label: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number }> }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'operations', label: 'Operations', icon: CircleDot },
  { id: 'network', label: 'Asset network', icon: Network },
  { id: 'tasks', label: 'Action board', icon: ClipboardCheck },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 }
];
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function StatusPill({ value }: { value: string }) {
  return <span className={'status-pill status-' + value}><span className="status-dot" />{value.replace('_', ' ')}</span>;
}
function PriorityPill({ value }: { value: Priority }) {
  return <span className={'priority-pill priority-' + value}>{value}</span>;
}
function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="empty-state"><CheckCircle2 size={24}/><strong>{title}</strong><span>{description}</span></div>;
}

export default function App() {
  const [workspace, setWorkspace] = useState<Workspace>(loadWorkspace);
  const [view, setView] = useState<View>('overview');
  const [mobileNav, setMobileNav] = useState(false);
  const [clock, setClock] = useState(new Date());
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OperationStatus>('all');
  const [showOperationForm, setShowOperationForm] = useState(false);
  const [operationTitle, setOperationTitle] = useState('');
  const [sector, setSector] = useState('');
  const [owner, setOwner] = useState('');
  const [priority, setPriority] = useState<Priority>('normal');
  const [newTask, setNewTask] = useState('');
  const [taskPriority, setTaskPriority] = useState<Priority>('normal');
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace)); }
    catch { setNotice('Local storage is unavailable. Export a snapshot to save your changes.'); }
  }, [workspace]);

  function apply(change: (value: Workspace) => Workspace, description: string) {
    setWorkspace(prev => {
      const next = change(prev);
      return {
        ...next, mode: 'local',
        activity: [{ id: makeId(), description, created: new Date().toISOString() }, ...prev.activity].slice(0, 100)
      };
    });
  }

  function addOperation(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const title = operationTitle.trim();
    if (!title) return;
    apply(prev => ({
      ...prev,
      operations: [{
        id: makeId(), title, sector: sector.trim() || 'Unassigned',
        owner: owner.trim() || 'Unassigned', priority, status: 'active', created: new Date().toISOString()
      }, ...prev.operations]
    }), 'Created operation: ' + title);
    setOperationTitle(''); setSector(''); setOwner(''); setPriority('normal'); setShowOperationForm(false);
  }

  function updateOperation(id: string, status: OperationStatus) {
    const target = workspace.operations.find(o => o.id === id);
    if (!target || target.status === status) return;
    apply(prev => ({ ...prev, operations: prev.operations.map(o => o.id === id ? { ...o, status } : o) }),
      'Updated ' + target.title + ' to ' + status);
  }
  function removeOperation(id: string) {
    const target = workspace.operations.find(o => o.id === id);
    if (!target || !window.confirm('Remove "' + target.title + '" from your workspace?')) return;
    apply(prev => ({ ...prev, operations: prev.operations.filter(o => o.id !== id) }), 'Removed operation: ' + target.title);
  }
  function updateAsset(id: string, status: AssetStatus) {
    const target = workspace.assets.find(a => a.id === id);
    if (!target || target.status === status) return;
    apply(prev => ({
      ...prev, assets: prev.assets.map(a => a.id === id ? { ...a, status, updated: new Date().toISOString() } : a)
    }), 'Marked ' + target.name + ' as ' + status);
  }
  function addTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const title = newTask.trim();
    if (!title) return;
    apply(prev => ({
      ...prev, tasks: [{ id: makeId(), title, priority: taskPriority, done: false }, ...prev.tasks]
    }), 'Added task: ' + title);
    setNewTask(''); setTaskPriority('normal');
  }
  function toggleTask(id: string) {
    const target = workspace.tasks.find(t => t.id === id);
    if (!target) return;
    apply(prev => ({
      ...prev, tasks: prev.tasks.map(t => t.id === id ? { ...t, done: !t.done } : t)
    }), (target.done ? 'Reopened task: ' : 'Completed task: ') + target.title);
  }
  function removeTask(id: string) {
    const target = workspace.tasks.find(t => t.id === id);
    if (!target) return;
    apply(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== id) }), 'Removed task: ' + target.title);
  }
  function exportWorkspace() {
    const blob = new Blob([JSON.stringify({ ...workspace, mode: 'local' }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'system-zero-workspace.json';
    document.body.appendChild(a); a.click(); a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice('Workspace exported as JSON.');
  }
  async function importWorkspace(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 1024 * 1024) { setNotice('Snapshot must be smaller than 1 MB.'); return; }
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!validWorkspace(parsed)) throw new Error('Invalid workspace schema');
      setWorkspace({ ...parsed, mode: 'local' });
      setNotice('Workspace restored from file.');
    } catch { setNotice('Import failed. Choose a valid System Zero workspace JSON snapshot.'); }
  }
  function resetDemo() {
    if (!window.confirm('Replace your local workspace with sample data? Export first to keep your changes.')) return;
    setWorkspace(seed()); setNotice('Demo workspace restored.');
  }

  const activeOps = workspace.operations.filter(o => o.status === 'active').length;
  const watchOps = workspace.operations.filter(o => o.status === 'watch').length;
  const resolvedOps = workspace.operations.filter(o => o.status === 'resolved').length;
  const healthyAssets = workspace.assets.filter(a => a.status === 'online').length;
  const completedTasks = workspace.tasks.filter(t => t.done).length;
  const taskPercent = workspace.tasks.length ? Math.round(completedTasks * 100 / workspace.tasks.length) : 0;
  const filteredOperations = useMemo(() => workspace.operations.filter(o => {
    const matchesSearch = (o.title + ' ' + o.sector + ' ' + o.owner).toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (statusFilter === 'all' || o.status === statusFilter);
  }), [workspace.operations, search, statusFilter]);

  const priorityChart = priorities.map(p => ({ name: capitalize(p), total: workspace.operations.filter(o => o.priority === p).length }));
  const statusChart = operationStatuses.map(s => ({ name: capitalize(s), value: workspace.operations.filter(o => o.status === s).length }));
  const chartColors = ['#F59E0B', '#38BDF8', '#34D399'];
  const clockUTC = [number(clock.getUTCHours()), number(clock.getUTCMinutes()), number(clock.getUTCSeconds())].join(':');

  const operationsTable = (rows: Operation[]) => (
    <div className="table-scroll">
      <table className="data-table">
        <thead><tr><th>Operation</th><th>Sector</th><th>Priority</th><th>Status</th><th>Owner</th><th aria-label="Actions" /></tr></thead>
        <tbody>{rows.map(o => (
          <tr key={o.id}>
            <td><span className="table-primary">{o.title}</span><small>REF {o.id.slice(0, 9).toUpperCase()}</small></td>
            <td>{o.sector}</td>
            <td><PriorityPill value={o.priority}/></td>
            <td><select aria-label={'Status of ' + o.title} className={'inline-select select-' + o.status} value={o.status}
              onChange={e => updateOperation(o.id, e.target.value as OperationStatus)}>
              {operationStatuses.map(s => <option key={s} value={s}>{capitalize(s)}</option>)}
            </select></td>
            <td>{o.owner}</td>
            <td><button className="icon-button destructive" type="button" title={'Delete ' + o.title} aria-label={'Delete ' + o.title}
              onClick={() => removeOperation(o.id)}><Trash2 size={15}/></button></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );

  return (
    <div className="app-shell">
      {mobileNav && <button className="mobile-backdrop" aria-label="Close navigation" onClick={() => setMobileNav(false)}/>}
      <aside className={'sidebar ' + (mobileNav ? 'sidebar-open' : '')}>
        <div className="brand"><div className="brand-mark"><RadioTower size={25} strokeWidth={2.1}/></div>
          <div><strong>SYSTEM ZERO</strong><span>TACTICAL WORKSPACE</span></div>
          <button type="button" className="mobile-close" aria-label="Close menu" onClick={() => setMobileNav(false)}><X size={20}/></button>
        </div>
        <div className="sidebar-section-title">WORKSPACE</div>
        <nav className="nav-list" aria-label="Main navigation">
          {navigation.map(n => {
            const Icon = n.icon;
            return <button key={n.id} type="button" className={'nav-item ' + (view === n.id ? 'nav-active' : '')}
              aria-current={view === n.id ? 'page' : undefined}
              onClick={() => { setView(n.id); setMobileNav(false); }}>
              <Icon size={19} strokeWidth={1.8}/><span>{n.label}</span>{view === n.id && <span className="nav-current"/>}
            </button>;
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-data-note"><ShieldCheck size={18}/><div><strong>LOCAL-FIRST MODE</strong><span>No remote feeds connected. Data stays in this browser unless you export it.</span></div></div>
          <div className="sidebar-footer">SZ / WORKSPACE v2.0 <span>•</span> CLOUD READY</div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button className="menu-button" aria-label="Open navigation" onClick={() => setMobileNav(true)}><Menu size={21}/></button>
            <span className="breadcrumb">SYSTEM ZERO</span><span className="breadcrumb-slash">/</span>
            <span className="breadcrumb-active">{pageCopy[view].title.toUpperCase()}</span>
          </div>
          <div className="topbar-right">
            <span className="local-indicator"><span/> BROWSER-LOCAL</span>
            <span className="utc-clock"><Clock3 size={14}/>{clockUTC} UTC</span>
          </div>
        </header>

        <div className="page-body">
          <div className="page-heading">
            <div><div className="eyebrow"><span className="eyebrow-mark"/> {pageCopy[view].eyebrow}</div>
              <h1>{pageCopy[view].title}</h1><p>{pageCopy[view].description}</p>
            </div>
            <div className="heading-actions">
              <span className={'mode-badge ' + (workspace.mode === 'sample' ? 'mode-sample' : '')}>{workspace.mode === 'sample' ? 'SAMPLE DATA' : 'LOCAL DATA'}</span>
              <button className="button button-secondary" onClick={exportWorkspace}><Download size={16}/> Export</button>
              <button className="button button-secondary" onClick={() => importRef.current?.click()}><FileUp size={16}/> Import</button>
              <input ref={importRef} type="file" accept=".json,application/json" hidden onChange={importWorkspace}/>
            </div>
          </div>

          {notice && <div className="notice" role="status"><AlertCircle size={17}/>{notice}<button aria-label="Dismiss notice" onClick={() => setNotice('')}><X size={17}/></button></div>}
          {workspace.mode === 'sample' && <div className="demo-banner"><span className="banner-icon"><Gauge size={19}/></span>
            <div><strong>Explore the sample workspace</strong><span>All starting operations, nodes, and events are fictional examples. Nothing here is live infrastructure telemetry.</span></div>
            <button onClick={() => { setView('operations'); setShowOperationForm(true); }}>Create an operation <ArrowRight size={15}/></button>
          </div>}

          {view === 'overview' && <>
            <section className="stat-grid" aria-label="Workspace metrics">
              <div className="metric-card"><div className="metric-top"><span>ACTIVE OPERATIONS</span><Activity size={18}/></div><div className="metric-value">{number(activeOps)}<span className="metric-detail">in progress</span></div><div className="metric-footer"><span className="accent-dot"/> Based on saved operations</div></div>
              <div className="metric-card"><div className="metric-top"><span>REQUIRE ATTENTION</span><AlertCircle size={18}/></div><div className="metric-value">{number(watchOps + workspace.assets.filter(a => a.status !== 'online').length)}<span className="metric-detail">flagged</span></div><div className="metric-footer"><span className="amber-dot"/> Watched operations + assets</div></div>
              <div className="metric-card"><div className="metric-top"><span>ASSETS ONLINE</span><RadioTower size={18}/></div><div className="metric-value">{number(healthyAssets)}<span className="metric-detail">/ {number(workspace.assets.length)}</span></div><div className="metric-footer"><span className="green-dot"/> Manually maintained status</div></div>
              <div className="metric-card"><div className="metric-top"><span>TASK PROGRESS</span><ClipboardCheck size={18}/></div><div className="metric-value">{taskPercent}<span className="metric-detail">%</span></div><div className="progress-track"><div style={{ width: taskPercent + '%' }}/></div></div>
            </section>
            <div className="content-grid">
              <section className="panel panel-wide">
                <div className="panel-head"><div><span className="section-index">01 / LIVE REGISTER</span><h2>Current operations</h2></div>
                  <button className="link-button" onClick={() => setView('operations')}>View all <ArrowRight size={15}/></button></div>
                {workspace.operations.length ? operationsTable(workspace.operations.slice(0, 5)) : <EmptyState title="No operations" description="Create an operation to populate this register."/>}
              </section>
              <section className="panel"><div className="panel-head"><div><span className="section-index">02 / DISTRIBUTION</span><h2>Operation states</h2></div><CircleDot size={18} className="panel-icon"/></div>
                <div className="distribution-list">
                  {statusChart.map((item, i) => <div key={item.name} className="distribution-item"><div><span className="legend-dot" style={{ background: chartColors[i] }}/>{item.name}<strong>{item.value}</strong></div>
                    <div className="distribution-track"><span style={{ width: (workspace.operations.length ? item.value / workspace.operations.length * 100 : 0) + '%', background: chartColors[i] }}/></div></div>)}
                </div>
                <div className="distribution-bottom"><strong>{workspace.operations.length}</strong> total operations <span>{resolvedOps} resolved</span></div>
              </section>
              <section className="panel"><div className="panel-head"><div><span className="section-index">03 / ACTIONS</span><h2>Priority tasks</h2></div>
                  <button className="link-button" onClick={() => setView('tasks')}>Open board <ArrowRight size={15}/></button></div>
                <div className="compact-task-list">{workspace.tasks.filter(t => !t.done).slice(0, 4).map(t => (
                  <button className="compact-task" key={t.id} onClick={() => toggleTask(t.id)} title="Mark complete">
                    <span className="task-checkbox"/><span>{t.title}</span><PriorityPill value={t.priority}/></button>
                ))}</div>
                {!workspace.tasks.some(t => !t.done) && <EmptyState title="All caught up" description="There are no open tasks."/>}
              </section>
              <section className="panel"><div className="panel-head"><div><span className="section-index">04 / AUDIT TRAIL</span><h2>Recent activity</h2></div><Clock3 size={18} className="panel-icon"/></div>
                <div className="activity-list">{workspace.activity.slice(0, 5).map(a => <div className="activity-row" key={a.id}>
                  <span className="activity-marker"/><div><strong>{a.description}</strong><small>{formatShort(a.created)}</small></div></div>)}</div>
              </section>
            </div>
          </>}

          {view === 'operations' && <section className="panel main-panel">
            <div className="panel-head operations-head"><div><span className="section-index">OPERATIONS REGISTER / {workspace.operations.length} TOTAL</span><h2>All operations</h2></div>
              <button className="button button-primary" onClick={() => setShowOperationForm(v => !v)}><Plus size={17}/> New operation</button></div>
            {showOperationForm && <form className="create-form" onSubmit={addOperation}>
              <div className="form-heading"><h3>Create operation</h3><button type="button" className="icon-button" onClick={() => setShowOperationForm(false)} aria-label="Close form"><X size={17}/></button></div>
              <div className="form-grid">
                <label className="field field-wide">Operation name<input required maxLength={120} value={operationTitle} onChange={e => setOperationTitle(e.target.value)} placeholder="e.g. Shift handoff review"/></label>
                <label className="field">Sector<input maxLength={80} value={sector} onChange={e => setSector(e.target.value)} placeholder="e.g. Central Hub"/></label>
                <label className="field">Owner<input maxLength={80} value={owner} onChange={e => setOwner(e.target.value)} placeholder="Team or operator"/></label>
                <label className="field">Priority<select value={priority} onChange={e => setPriority(e.target.value as Priority)}>{priorities.map(p => <option key={p} value={p}>{capitalize(p)}</option>)}</select></label>
              </div><button className="button button-primary" type="submit"><Plus size={16}/> Add to register</button>
            </form>}
            <div className="filters-row"><label className="search-box"><Search size={18}/><input aria-label="Search operations" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search operations, sectors, owners"/></label>
              <label className="filter-select">Status <select aria-label="Filter by status" value={statusFilter} onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}><option value="all">All statuses</option>{operationStatuses.map(s => <option key={s} value={s}>{capitalize(s)}</option>)}</select><ChevronDown size={15}/></label></div>
            {filteredOperations.length ? operationsTable(filteredOperations) : <EmptyState title="No matching operations" description="Adjust your filters or add a new operation."/>}
          </section>}

          {view === 'network' && <><div className="subheading-row"><span>{workspace.assets.length} REGISTERED ASSETS</span><span>Statuses are manually entered — not network probes</span></div>
            <div className="asset-grid">{workspace.assets.map((asset, i) => <article className="asset-card" key={asset.id}>
              <div className="asset-card-top"><div className="asset-icon"><RadioTower size={22}/></div><span className="asset-index">NODE {number(i + 1)}</span></div>
              <div className="asset-title">{asset.name}</div><div className="asset-subtitle">{asset.type} <span>•</span> {asset.sector}</div>
              <div className="asset-divider"/><div className="asset-status-row"><span>Recorded status</span><StatusPill value={asset.status}/></div>
              <label className="field">Change status<select value={asset.status} onChange={e => updateAsset(asset.id, e.target.value as AssetStatus)}>{assetStatuses.map(s => <option key={s} value={s}>{capitalize(s)}</option>)}</select></label>
              <div className="asset-updated">LAST UPDATED <span>{formatShort(asset.updated)}</span></div>
            </article>)}</div>
            {!workspace.assets.length && <EmptyState title="No registered assets" description="Import a workspace snapshot to populate the asset register."/>}
            <div className="info-strip"><ShieldCheck size={18}/><p>This page is a manual inventory. It does not discover hosts, poll hardware, or imply live connectivity.</p></div>
          </>}

          {view === 'tasks' && <div className="tasks-layout"><section className="panel task-panel">
            <div className="panel-head"><div><span className="section-index">ACTION QUEUE / {workspace.tasks.filter(t => !t.done).length} OPEN</span><h2>Task board</h2></div><ClipboardCheck size={20} className="panel-icon"/></div>
            <form className="task-form" onSubmit={addTask}><input aria-label="Task title" required maxLength={160} value={newTask} onChange={e => setNewTask(e.target.value)} placeholder="Add a new action item"/>
              <select aria-label="Task priority" value={taskPriority} onChange={e => setTaskPriority(e.target.value as Priority)}>{priorities.map(p => <option key={p} value={p}>{capitalize(p)}</option>)}</select><button className="button button-primary" type="submit"><Plus size={17}/> Add</button></form>
            <div className="task-section-label">OPEN TASKS</div>
            {workspace.tasks.filter(t => !t.done).map(t => <div key={t.id} className="task-row"><button className="task-check" title="Mark completed" aria-label={'Complete ' + t.title} onClick={() => toggleTask(t.id)}/><div className="task-name">{t.title}</div><PriorityPill value={t.priority}/><button className="icon-button destructive" aria-label={'Delete ' + t.title} onClick={() => removeTask(t.id)}><Trash2 size={16}/></button></div>)}
            {!workspace.tasks.some(t => !t.done) && <EmptyState title="No open tasks" description="Add a task above to get started."/>}
            <div className="task-section-label completed-label">COMPLETED TASKS</div>
            {workspace.tasks.filter(t => t.done).map(t => <div key={t.id} className="task-row task-done"><button className="task-check checked" aria-label={'Reopen ' + t.title} onClick={() => toggleTask(t.id)}><CheckCircle2 size={20}/></button><div className="task-name">{t.title}</div><PriorityPill value={t.priority}/><button className="icon-button destructive" aria-label={'Delete ' + t.title} onClick={() => removeTask(t.id)}><Trash2 size={16}/></button></div>)}
          </section><aside className="panel task-side"><span className="section-index">PROGRESS MONITOR</span><h2>Completion</h2><div className="completion-number">{taskPercent}<span>%</span></div>
            <div className="progress-track large"><div style={{ width: taskPercent + '%' }}/></div><p>{completedTasks} of {workspace.tasks.length} tasks completed.</p>
            <div className="task-side-divider"/><span className="section-index">DATA POLICY</span><p>Updates are saved locally in your browser. Use Export to back up or move your workspace.</p></aside></div>}

          {view === 'analytics' && <><div className="analytics-grid">
            <section className="panel chart-panel"><div className="panel-head"><div><span className="section-index">01 / PRIORITY MIX</span><h2>Operations by priority</h2></div><BarChart3 size={18} className="panel-icon"/></div>
              <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><BarChart data={priorityChart} margin={{ top: 10, right: 12, left: -20, bottom: 10 }}>
                <CartesianGrid vertical={false} stroke="#243244" strokeDasharray="4 4"/><XAxis dataKey="name" stroke="#91a0b5" tickLine={false} axisLine={false}/><YAxis allowDecimals={false} stroke="#91a0b5" tickLine={false} axisLine={false}/>
                <Tooltip cursor={{ fill: '#1c2a3a' }} contentStyle={{ background: '#131e2b', border: '1px solid #304156', borderRadius: 8, color: '#e7edf5' }}/><Bar dataKey="total" name="Operations" fill="#eeb15b" radius={[5, 5, 0, 0]} maxBarSize={64}/>
              </BarChart></ResponsiveContainer></div></section>
            <section className="panel chart-panel"><div className="panel-head"><div><span className="section-index">02 / WORKLOAD STATES</span><h2>Operation lifecycle</h2></div><Activity size={18} className="panel-icon"/></div>
              <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={statusChart.filter(d => d.value > 0)} dataKey="value" nameKey="name" innerRadius={74} outerRadius={113} paddingAngle={3} stroke="none">
                {statusChart.filter(d => d.value > 0).map(d => <Cell key={d.name} fill={chartColors[operationStatuses.indexOf(d.name.toLowerCase() as OperationStatus)]}/>)}
              </Pie><Tooltip contentStyle={{ background: '#131e2b', border: '1px solid #304156', borderRadius: 8, color: '#e7edf5' }}/></PieChart></ResponsiveContainer></div>
              <div className="chart-legend">{statusChart.map((d, i) => <span key={d.name}><span style={{ background: chartColors[i] }}/>{d.name}: {d.value}</span>)}</div></section>
          </div><div className="analytics-bottom"><div><span className="section-index">CURRENT SNAPSHOT</span><h2>Data quality</h2><p>Analytics update from records you maintain in this workspace. This version includes no remote data connection.</p></div>
            <div className="quality-stats"><div><strong>{workspace.operations.length}</strong><span>Operations</span></div><div><strong>{workspace.assets.length}</strong><span>Assets</span></div><div><strong>{workspace.tasks.length}</strong><span>Tasks</span></div><div><strong>{workspace.activity.length}</strong><span>Events</span></div></div></div></>}

          <footer className="page-footer"><span><span className="footer-dot"/> SYSTEM ZERO / LOCAL WORKSPACE</span><div><button onClick={resetDemo}><RotateCcw size={14}/> Reset sample</button><span>Built for Cloudflare Workers</span></div></footer>
        </div>
      </main>
    </div>
  );
}
