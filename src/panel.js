export function panelHTML(username) {
  return `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="icon" href="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20100%20100'%3E%3Ctext%20y='.9em'%20font-size='90'%3E%F0%9F%94%92%3C/text%3E%3C/svg%3E">
<title>EdgeLock 云控</title><style>
:root{color-scheme:dark}
*{box-sizing:border-box}
body{margin:0;background:#0b0f14;color:#d7e0ea;
font:14px/1.6 "Segoe UI",system-ui,sans-serif}
.top{display:flex;align-items:center;gap:14px;padding:14px 22px;
background:#101722;border-bottom:1px solid #1d2a3d;position:sticky;top:0;z-index:5}
.top h1{margin:0;font-size:17px;letter-spacing:.5px}
.badge{font-size:12px;color:#7f93ab}
.sp{flex:1}
button{padding:7px 14px;border:0;border-radius:7px;background:#2563eb;color:#fff;
font-size:13px;cursor:pointer}
button:hover{background:#1d4ed8}
button:disabled{opacity:.5;cursor:not-allowed}
button.ghost{background:#1b2739;color:#b9c8db}
button.ghost:hover{background:#24344b}
button.warn{background:#b45309}
button.danger{background:#b91c1c}
.wrap{max-width:1280px;margin:0 auto;padding:22px}
.sec{background:#121923;border:1px solid #223047;border-radius:12px;
padding:16px 18px;margin-bottom:18px}
.sec h2{margin:0 0 12px;font-size:15px;color:#9fb4cc;font-weight:600}
.twrap{overflow-x:auto}
table{width:100%;border-collapse:collapse;font-size:13px}
th,td{text-align:left;padding:8px 10px;border-bottom:1px solid #1b2636;vertical-align:middle;white-space:nowrap}
th{color:#7f93ab;font-weight:600;font-size:12px}
tr:last-child td{border-bottom:0}
.dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px}
.on{background:#22c55e}.off{background:#475569}
.tag{display:inline-block;padding:1px 8px;border-radius:10px;font-size:12px}
.t-restricted{background:#3f1d1d;color:#fca5a5}
.t-restored{background:#14351f;color:#86efac}
.t-unknown{background:#26313f;color:#94a3b8}
.t-banall{background:#3f1d1d;color:#fca5a5}
.t-bansite{background:#3b2713;color:#fcd34d}
.t-banoff{background:#26313f;color:#94a3b8}
.s-pending{background:#3b3413;color:#fde047}
.s-delivered{background:#123448;color:#7dd3fc}
.s-done{background:#14351f;color:#86efac}
.s-failed{background:#3f1d1d;color:#fca5a5}
.row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
input,select,textarea{padding:8px 10px;border-radius:7px;border:1px solid #2a3a52;
background:#0d1420;color:#e7eef7;font-size:13px;outline:none}
input:focus,select:focus,textarea:focus{border-color:#3b82f6}
textarea{width:100%;font-family:Consolas,monospace;font-size:12px;resize:vertical}
.mono{font-family:Consolas,monospace;font-size:12px;color:#8fa3bb}
.muted{color:#64748b;font-size:12px}
#toast{position:fixed;right:18px;bottom:18px;padding:11px 16px;border-radius:9px;
background:#1e293b;border:1px solid #334155;opacity:0;transition:.25s;pointer-events:none;z-index:9}
#toast.show{opacity:1}
@media(max-width:720px){
.wrap{padding:10px}
.top{flex-wrap:wrap;gap:8px;padding:10px 12px}
.top h1{font-size:15px}
.top .sp{display:none}
.top button{padding:8px 12px;font-size:13px}
#clock{display:none}
.cards{gap:8px}
.card{min-width:calc(50% - 8px);padding:10px 12px}
.card .v{font-size:22px}
.charts{flex-direction:column}
.chart{min-width:0}
table{font-size:12px}
th,td{padding:6px 8px;white-space:nowrap}
.twrap{overflow-x:auto;-webkit-overflow-scrolling:touch}
.row{gap:6px}
.row input,.row select{flex:1 1 140px;min-width:0;font-size:14px}
.row button{flex:1 1 calc(50% - 6px);padding:10px 12px}
.radio{gap:10px}
.radio label{font-size:14px}
.chkgrid{gap:6px 10px}
.chkgrid label{font-size:14px;padding:4px 0}
textarea{font-size:13px}
#toast{left:12px;right:12px;bottom:12px;padding:12px 14px}
h2{font-size:14px}
}
.cards{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:16px}
.card{flex:1;min-width:130px;background:#0d1420;border:1px solid #1b2636;
border-radius:10px;padding:12px 14px}
.card .v{font-size:24px;font-weight:700;color:#60a5fa}
.card .k{font-size:12px;color:#7f93ab;margin-top:2px}
.charts{display:flex;gap:16px;flex-wrap:wrap}
.chart{flex:1;min-width:260px}
.ch-t{font-size:12px;color:#8fa3bb;margin-bottom:8px}
.bars{display:flex;align-items:flex-end;gap:3px;height:110px;
background:#0d1420;border:1px solid #1b2636;border-radius:8px;padding:8px}
.bar{flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;
gap:2px;min-width:0;height:100%}
.bar .b{width:100%;background:#3b82f6;border-radius:3px 3px 0 0;min-height:2px}
.bar .l{font-size:9px;color:#64748b;white-space:nowrap;overflow:hidden}
.regrow{display:flex;align-items:center;gap:8px;font-size:12px;margin:3px 0}
.regrow .nm{width:150px;color:#b9c8db;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.regrow .tr{flex:1;height:8px;background:#16202e;border-radius:4px;overflow:hidden}
.regrow .fl{height:100%;background:#2563eb}
.regrow .nb{width:60px;color:#7f93ab;text-align:right}
.chip{display:inline-block;background:#16202e;border:1px solid #26334a;border-radius:10px;
padding:1px 9px;font-size:12px;color:#b9c8db;margin:1px 3px 1px 0;cursor:default}
.chip b{color:#60a5fa;font-weight:600}
.chkgrid{display:flex;flex-wrap:wrap;gap:4px 14px;margin:8px 0}
.chkgrid label{font-size:13px;color:#c6d2e2;display:inline-flex;align-items:center;gap:5px;cursor:pointer}
.feed{max-height:260px;overflow-y:auto;background:#0d1420;border:1px solid #1b2636;border-radius:8px;padding:8px 12px;font-size:13px}
.feed .ev{padding:2px 0;border-bottom:1px dashed #1b2636;display:flex;gap:8px}
.feed .ev:last-child{border-bottom:0}
.feed .ev .t{color:#64748b;white-space:nowrap}
.feed .ev .who{color:#b9c8db;white-space:nowrap}
.feed .ev .nm{color:#fcd34d}
.feed .ev .nm.custom{color:#7dd3fc}
.feed .empty{color:#64748b;padding:10px 0}
.radio{display:flex;gap:18px;flex-wrap:wrap;margin:6px 0}
.radio label{display:inline-flex;align-items:center;gap:6px;cursor:pointer;font-size:13px;color:#c6d2e2}
</style></head><body>
<div class="top">
  <h1>EdgeLock 云控</h1>
  <span class="badge" id="who">${username}</span>
  <span class="badge" id="clock"></span>
  <span class="sp"></span>
  <button class="ghost" id="refreshBtn">刷新</button>
  <button class="ghost" id="acctBtn">改账号密码</button>
  <button class="ghost" id="outBtn">退出</button>
</div>
<div class="wrap">
  <div class="sec">
    <h2>统计概览</h2>
    <div class="cards" id="cards"></div>
    <div class="charts">
      <div class="chart"><div class="ch-t">近14天每日在线设备数</div><div id="dailyChart" class="bars"></div></div>
      <div class="chart"><div class="ch-t">近24小时上报分布（时段）</div><div id="hourlyChart" class="bars"></div></div>
      <div class="chart"><div class="ch-t">地区分布</div><div id="regionChart" class="bars"></div></div>
    </div>
  </div>
  <div class="sec">
    <h2>实时拦截动态 <span class="muted" id="hitsNote">（学生尝试打开被封禁的网站时即时记录，含全部封禁与自定义域名）</span></h2>
    <div id="hitsFeed" class="feed"></div>
  </div>
  <div class="sec">
    <h2>设备列表 <span class="muted" id="devCount"></span></h2>
    <div class="row" style="margin-bottom:10px">
      <span class="muted">批量目标</span>
      <select id="bulkGroup" style="min-width:150px"><option value="*">全部设备</option><option value="group:">未分组</option></select>
      <button class="warn" id="bulkLock">下发锁定</button>
      <button id="bulkRestore">下发解除</button>
      <span style="border-left:1px solid #2a3a52;height:22px"></span>
      <input id="newPw" placeholder="新解除密码(4-16位数字)" style="width:190px">
      <button id="setPw">远程改密码(全部)</button>
      <span class="muted">当前密码: <b id="curPw">-</b></span>
    </div>
    <div class="twrap"><table><thead><tr>
      <th>在线</th><th>设备</th><th>主机名</th><th>分组</th><th>Edge状态</th><th>拦截</th>
      <th>解控申请</th><th>正在浏览</th><th>IP</th><th>版本</th><th>最后上报</th><th>备注</th><th>操作</th>
    </tr></thead><tbody id="devs"></tbody></table></div>
  </div>
  <div class="sec">
    <h2>网站封禁（重定向拦截，设备约30秒内生效）</h2>
    <div class="row">
      <span class="muted">生效分组</span>
      <select id="banGroup" style="min-width:170px"><option value="">全局（含未分组）</option></select>
      <span class="muted" id="banCur"></span>
    </div>
    <div class="radio">
      <label><input type="radio" name="banMode" value="off">不启用</label>
      <label><input type="radio" name="banMode" value="site">按网站拦截</label>
      <label><input type="radio" name="banMode" value="all">拦截所有网站</label>
      <label style="margin-left:18px"><input type="checkbox" id="banDisable"> 禁用浏览器（旧方法：锁定文件，Edge 无法启动）</label>
    </div>
    <div class="muted">「拦截」= 访问被封禁网站时重定向到拦截页（域名不变）；「禁用」= Edge 直接无法启动。两者独立，可同时启用。</div>
    <div class="chkgrid" id="siteChk"></div>
    <div class="row">
      <input id="customDomains" placeholder="自定义域名，逗号分隔，如 games.com,cdn.example.net" style="flex:1;min-width:280px">
      <button id="banSave">保存封禁配置</button>
      <button class="ghost" id="banClear">清除该组配置</button>
    </div>
    <div class="muted" style="margin-top:8px">启用后设备会用本地 DNS 把目标网站指到拦截页，浏览器地址栏域名保持不变，学生只看到拦截页内容。</div>
  </div>
  <div class="sec">
    <h2>拦截页内容（预设2页）
      <a class="muted" href="/blockpage/site" target="_blank">预览：网站封禁页</a>&nbsp;
      <a class="muted" href="/blockpage/browser" target="_blank">预览：禁用浏览器页</a>
    </h2>
    <div class="muted" style="margin-bottom:4px">页面一：按网站封禁时显示</div>
    <textarea id="pageSite" rows="4"></textarea>
    <div class="muted" style="margin:8px 0 4px">页面二：禁止使用浏览器时显示</div>
    <textarea id="pageBrowser" rows="4"></textarea>
    <div class="row" style="margin-top:8px">
      <button id="pageSave">保存拦截页</button>
      <button class="ghost" id="pageReset">恢复默认文案</button>
    </div>
  </div>
  <div class="sec">
    <h2>静默更新（可按分组下发）</h2>
    <div class="row">
      <span class="muted">生效分组</span>
      <select id="updGroup" style="min-width:170px"><option value="">全局（所有设备）</option></select>
      <input id="uVer" placeholder="最新版本号，如 1.2.0" style="width:150px">
      <input id="uUrl" placeholder="下载地址 https://.../EdgeCtrl.exe" style="flex:1;min-width:240px">
      <input id="uSha" placeholder="SHA256（可选，64位hex）" style="width:220px">
      <button id="uSave">保存更新设置</button>
      <button class="ghost" id="uClear">清除</button>
    </div>
    <div class="muted" style="margin-top:8px" id="uCur">当前: 未设置</div>
  </div>
  <div class="sec">
    <h2>指令历史（最近100条）</h2>
    <div class="twrap"><table><thead><tr>
      <th>#</th><th>时间</th><th>设备</th><th>类型</th><th>参数</th><th>状态</th><th>结果</th>
    </tr></thead><tbody id="cmds"></tbody></table></div>
  </div>
</div>
<div id="toast"></div>
<script>
const $=id=>document.getElementById(id);
let DATA=null,STATS=null;

function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');
clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('show'),2600);}

async function api(path,body){
  const opt=body?{method:'POST',headers:{'content-type':'application/json'},
    body:JSON.stringify(body)}:{};
  const r=await fetch(path,opt);
  if(r.status===401){location.reload();throw new Error('unauthorized');}
  const j=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(j.error||('HTTP '+r.status));
  return j;
}

function fmtTime(sec){
  if(!sec)return '-';
  const d=new Date(sec*1000);
  return d.toLocaleString('zh-CN',{hour12:false});
}

async function load(){
  try{
    const [ov,st]=await Promise.all([
      api('/api/admin/overview'),
      api('/api/admin/stats'),
    ]);
    DATA=ov;STATS=st;
    render();renderStats();
  }catch(e){toast('加载失败: '+e.message);}
}

function renderStats(){
  const s=STATS;if(!s)return;
  const c=s.current;
  const devs=(DATA&&DATA.devices)||[];
  const banned=devs.filter(x=>x.status==='restricted').length;
  const intercept=devs.filter(x=>x.ban==='site'||x.ban==='all').length;
  $('cards').innerHTML=[
    ['当前在线',c.online_now],
    ['历史总在线(设备)',c.total_devices],
    ['Edge已锁定',banned],
    ['拦截生效中',intercept],
    ['累计拦截次数',DATA.hits_total||0],
    ['累计上报',c.reports_total],
  ].map(([k,v])=>\`<div class="card"><div class="v">\${v}</div><div class="k">\${k}</div></div>\`).join('');
  renderHitsFeed();

  $('dailyChart').innerHTML=barChart(s.daily,'day','devices',14);
  $('hourlyChart').innerHTML=barChart(s.hourly,'hour','reports',24,true);
  const regs=s.regions;
  const max=Math.max(1,...regs.map(r=>r.n));
  $('regionChart').innerHTML=regs.length?regs.map(r=>\`
    <div class="regrow"><span class="nm" title="\${esc(r.region)}">\${esc(r.region)}</span>
    <span class="tr"><span class="fl" style="width:\${Math.round(r.n/max*100)}%"></span></span>
    <span class="nb">\${r.n}台/\${r.online}在线</span></div>\`).join('')
    :'<div class="muted">暂无数据</div>';
}

function barChart(rows,keyField,valField,slots,pad){
  const map={};
  for(const r of rows)map[r[keyField]]=r[valField]||0;
  let labels=[];
  if(pad){
    const now=new Date();
    for(let i=slots-1;i>=0;i--){
      const d=new Date(now.getTime()-i*3600000);
      labels.push(String(d.getHours()).padStart(2,'0'));
    }
  }else{
    for(let i=slots-1;i>=0;i--){
      const d=new Date(Date.now()-i*86400000);
      labels.push(d.toISOString().slice(5,10));
    }
  }
  const vals=labels.map(l=>map[l]??0);
  const max=Math.max(1,...vals);
  return labels.map((l,i)=>\`
    <div class="bar" title="\${l}: \${vals[i]}">
      <div class="b" style="height:\${Math.round(vals[i]/max*100)}%"></div>
      <div class="l">\${pad?l:l.slice(3)}</div>
    </div>\`).join('');
}

// ---------- 实时拦截动态 ----------
function renderHitsFeed(){
  const feed=DATA.hits_feed||[];
  if(!feed.length){$('hitsFeed').innerHTML='<div class="empty">暂无拦截记录（启用网站封禁后，学生尝试打开被封禁的网站会在这里即时显示）</div>';return;}
  $('hitsFeed').innerHTML=feed.map(h=>{
    // 站点目录名（中文）黄色；自定义域名蓝色
    const custom=/^[\w.-]+\.[a-z]{2,}$/i.test(h.name);
    return \`<div class="ev"><span class="t">\${new Date(h.ts*1000).toLocaleTimeString('zh-CN',{hour12:false})}</span><span class="who">\${esc(h.host||'')}</span><span>尝试打开 <b class="nm \${custom?'custom':''}">\${esc(h.name)}</b>，已拦截</span></div>\`;
  }).join('');
}

// ---------- 分组选项同步（批量目标 / 封禁 / 更新 三处下拉共用） ----------
function groupOptions(){
  const gs=(DATA.groups||[]);
  const opts=[{v:'group:',t:'未分组'}];
  for(const g of gs)opts.push({v:'group:'+g,t:g});
  return opts;
}
function fillGroupSel(sel,val,withAll,withGlobal){
  sel.innerHTML='';
  if(withAll){const o=document.createElement('option');o.value='*';o.textContent='全部设备';sel.appendChild(o);}
  if(withGlobal){const o=document.createElement('option');o.value='';o.textContent='全局（含未分组）';sel.appendChild(o);}
  for(const g of groupOptions()){
    const o=document.createElement('option');o.value=g.v;o.textContent=g.t;sel.appendChild(o);
  }
  if(val!==undefined&&val!==null)sel.value=val;
}

function statusTag(s){
  const m={restricted:'已锁定',restored:'已解除',unknown:'未知'};
  return \`<span class="tag t-\${esc(s||'unknown')}">\${m[s]||'未知'}</span>\`;
}
function banTag(s){
  const m={all:['全部拦截','t-banall'],site:['按网站','t-bansite'],off:['未启用','t-banoff']};
  const e=m[s]||m.off;
  return \`<span class="tag \${e[1]}">\${e[0]}</span>\`;
}
function siteChips(list){
  if(!list||!list.length)return '<span class="muted">-</span>';
  return list.slice(0,6).map(s=>{
    const t=s.t?(' title="'+esc(s.t)+'"'):'';
    const extra=s.c>1?(' <b>×'+s.c+'</b>'):'';
    return '<span class="chip"'+t+'>'+esc(s.n)+extra+'</span>';
  }).join('');
}

function render(){
  const d=DATA;
  $('curPw').textContent=d.password;
  fillGroupSel($('bulkGroup'),$('bulkGroup').value,true,false);
  fillGroupSel($('banGroup'),$('banGroup').value,false,true);
  fillGroupSel($('updGroup'),$('updGroup').value,false,true);

  const upd=d.updates||{};
  $('uCur').textContent='当前('+$('updGroup').selectedOptions[0].textContent+'): '+
    updSummary(upd[$('updGroup').value]||{})+($('updGroup').value!==''?'　回退: '+updSummary(upd['']||{}):'');
  const u=d.update||{};
  $('uVer').placeholder=u.latest||'最新版本号，如 1.2.0';

  const bans=d.bans||{};
  renderBanEditor(bans[$('banGroup').value]||null);

  const pages=d.blockpages||{};
  if(document.activeElement!==$('pageSite'))$('pageSite').value=pages.site_html||'';
  if(document.activeElement!==$('pageBrowser'))$('pageBrowser').value=pages.browser_html||'';

  const devs=d.devices||[];
  $('devCount').textContent='共 '+devs.length+' 台，在线 '+devs.filter(x=>x.online).length+
    '，锁定 '+devs.filter(x=>x.status==='restricted').length;
  $('devs').innerHTML=devs.length?devs.map(x=>{
    const req=x.unlock_req?\`<span class="tag t-bansite">✋\${esc(x.unlock_req)}</span> <button class="warn" data-cmd="restore" data-dev="\${esc(x.device_id)}">批准</button>\`:'<span class="muted">-</span>';
    return \`
    <tr>
      <td><span class="dot \${x.online?'on':'off'}"></span>\${x.online?'在线':'离线'}</td>
      <td class="mono">\${esc(x.device_id)}</td>
      <td>\${esc(x.hostname)||'-'}</td>
      <td><input data-group="\${esc(x.device_id)}" value="\${esc(x.group_name||'')}" placeholder="未分组" style="width:90px"></td>
      <td>\${statusTag(x.status)}</td>
      <td>\${banTag(x.ban)}\${x.hits_total?\` <span class="muted">拦\${x.hits_total}次</span>\`:''}</td>
      <td>\${req}</td>
      <td>\${siteChips(x.sites)}</td>
      <td class="mono">\${esc(x.last_ip)||'-'}</td>
      <td>\${esc(x.version)||'-'}</td>
      <td class="muted">\${fmtTime(x.last_seen)}</td>
      <td><input data-note="\${esc(x.device_id)}" value="\${esc(x.note||'')}" style="width:110px"></td>
      <td class="row">
        <button class="warn" data-cmd="lock" data-dev="\${esc(x.device_id)}">锁定</button>
        <button data-cmd="restore" data-dev="\${esc(x.device_id)}">解除</button>
        <button class="ghost" data-save="1" data-dev="\${esc(x.device_id)}">保存</button>
      </td>
    </tr>\`}).join(''):\`<tr><td colspan="13" class="muted">暂无设备，等待客户端上报…</td></tr>\`;

  const cmds=d.commands||[];
  $('cmds').innerHTML=cmds.length?cmds.map(c=>\`
    <tr>
      <td>\${c.id}</td>
      <td class="muted">\${fmtTime(c.created_at)}</td>
      <td class="mono">\${esc(c.device_id)}</td>
      <td>\${cmdName(c.type)}\${c.type==='setpass'?' (新密码已生效)':''}</td>
      <td class="mono">\${esc(c.arg||'-')}</td>
      <td><span class="tag s-\${c.status}">\${statusName(c.status)}</span></td>
      <td class="muted">\${esc(c.result||'-')}</td>
    </tr>\`).join(''):\`<tr><td colspan="7" class="muted">暂无指令</td></tr>\`;
}

function updSummary(u){
  if(!u||!u.latest_version)return '未设置';
  return '版本 '+u.latest_version+' ← '+(u.update_url||'未填地址')+(u.update_sha256?'（含校验）':'（无校验）');
}

// ---------- 网站封禁编辑器 ----------
function renderSiteChk(sites){
  const cat=DATA.sites_catalog||[];
  $('siteChk').innerHTML=cat.map(s=>
    \`<label><input type="checkbox" data-site="\${esc(s.key)}" \${(sites||[]).includes(s.key)?'checked':''}>\${esc(s.name)}</label>\`
  ).join('');
}
function banEditorState(){
  return {
    mode: currentMode(),
    sites: [...document.querySelectorAll('#siteChk input:checked')].map(i=>i.dataset.site),
    domains: $('customDomains').value,
    disable: document.getElementById('banDisable').checked
  };
}
function currentMode(){
  const r=document.querySelector('input[name=banMode]:checked');
  return r?r.value:'off';
}
function renderBanEditor(cfg){
  const c=cfg||{mode:'off',sites:[],domains:[],disable:false};
  const r=document.querySelector('input[name=banMode][value="'+(c.mode||'off')+'"]');
  if(r)r.checked=true;
  document.getElementById('banDisable').checked=!!c.disable;
  if(document.activeElement!==$('customDomains'))
    $('customDomains').value=(c.domains||[]).join(',');
  renderSiteChk(c.sites||[]);
  $('banGroup').dataset.ready='1';
  const names=(c.sites||[]).map(k=>{
    const s=(DATA.sites_catalog||[]).find(x=>x.key===k);
    return s?s.name:k;});
  $('banCur').textContent=c.mode&&c.mode!=='off'
    ?('当前: '+(c.mode==='all'?'禁止全部网站':'封禁 '+(names.join('、')||'(无)')+(c.domains&&c.domains.length?(' +'+c.domains.length+'个自定义域名'):'')))
    :'当前: 未启用';
}

function esc(s){return String(s??'').replace(/[&<>"']/g,
  m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function cmdName(t){return {lock:'锁定',restore:'解除',setpass:'改密码'}[t]||t;}
function statusName(s){return {pending:'待下发',delivered:'已下发',done:'完成',failed:'失败'}[s]||s;}

async function send(deviceId,type,arg){
  try{
    const j=await api('/api/admin/command',{device_id:deviceId,type,arg:arg||''});
    toast('指令已排队（'+j.count+' 台）');
    setTimeout(load,700);
  }catch(e){toast('失败: '+e.message);}
}

document.addEventListener('click',async ev=>{
  const b=ev.target.closest('button');
  if(!b)return;
  if(b.dataset.cmd)return send(b.dataset.dev,b.dataset.cmd);
  if(b.dataset.save){
    const dev=b.dataset.dev;
    const note=document.querySelector('input[data-note="'+CSS.escape(dev)+'"]');
    const grp=document.querySelector('input[data-group="'+CSS.escape(dev)+'"]');
    try{
      await api('/api/admin/note',{device_id:dev,note:note?note.value:''});
      await api('/api/admin/setgroup',{device_id:dev,group:grp?grp.value.trim():''});
      toast('已保存');setTimeout(load,400);
    }catch(e){toast('失败: '+e.message);}
  }
});

$('bulkLock').onclick=()=>{const t=$('bulkGroup').value;if(confirm('确认对「'+$('bulkGroup').selectedOptions[0].textContent+'」下发锁定？'))send(t,'lock');};
$('bulkRestore').onclick=()=>{const t=$('bulkGroup').value;if(confirm('确认对「'+$('bulkGroup').selectedOptions[0].textContent+'」下发解除？'))send(t,'restore');};
$('setPw').onclick=async()=>{
  const pw=$('newPw').value.trim();
  if(!/^\\d{4,16}$/.test(pw)){toast('密码须为4-16位数字');return;}
  try{await api('/api/admin/password',{password:pw});
    await api('/api/admin/command',{device_id:'*',type:'setpass',arg:pw});
    toast('密码已修改并下发');$('newPw').value='';setTimeout(load,700);
  }catch(e){toast('失败: '+e.message);}
};
$('banGroup').onchange=()=>{$('banGroup').dataset.ready='0';renderBanEditor(((DATA.bans||{})[$('banGroup').value])||null);};
$('banSave').onclick=async()=>{
  const st=banEditorState();
  const sites=st.sites,domains=st.domains.split(',').map(x=>x.trim()).filter(Boolean);
  if(st.mode==='site'&&sites.length===0&&domains.length===0){toast('按网站封禁需至少勾选一个网站或填一个域名');return;}
  try{
    await api('/api/admin/groupban',{group:$('banGroup').value,mode:st.mode,sites:sites,domains:domains,disable:st.disable});
    toast('封禁配置已保存，设备约30秒内生效');setTimeout(load,500);
  }catch(e){toast('失败: '+e.message);}
};
$('banClear').onclick=async()=>{
  try{await api('/api/admin/groupban',{group:$('banGroup').value,mode:'off',sites:[],domains:[]});
    toast('已清除该组封禁配置');setTimeout(load,500);}
  catch(e){toast('失败: '+e.message);}
};
$('pageSave').onclick=async()=>{
  try{
    await api('/api/admin/blockpage',{which:'site',html:$('pageSite').value});
    await api('/api/admin/blockpage',{which:'browser',html:$('pageBrowser').value});
    toast('拦截页已保存');
  }catch(e){toast('失败: '+e.message);}
};
$('pageReset').onclick=async()=>{
  const p1=prompt('页面一标题（按网站封禁时显示）','该网站已被教师封禁');if(p1===null)return;
  const p2=prompt('页面二标题（禁止使用浏览器时显示）','您已被教师禁止使用浏览器');if(p2===null)return;
  try{
    await api('/api/admin/blockpage',{which:'site',html:defaultPage(p1||'该网站已被教师封禁')});
    await api('/api/admin/blockpage',{which:'browser',html:defaultPage(p2||'您已被教师禁止使用浏览器')});
    toast('已恢复默认文案');setTimeout(load,500);
  }catch(e){toast('失败: '+e.message);}
};
function defaultPage(title){
  return '<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>'+esc(title)+'</title>'+
  '<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0e1524;color:#e8edf7;'+
  'font:16px/1.7 "Segoe UI","Microsoft YaHei",system-ui,sans-serif;text-align:center}'+
  'h1{font-size:26px}p{color:#8b98b0}</style></head><body><div>'+
  '<div style="font-size:56px"></div><h1>'+esc(title)+'</h1><p>如需使用请联系老师</p></div></body></html>';
}
$('updGroup').onchange=()=>{
  const u=(DATA.updates||{})[$('updGroup').value]||{};
  $('uVer').value=u.latest_version||'';
  $('uUrl').value=u.update_url||'';
  $('uSha').value=u.update_sha256||'';
  $('uCur').textContent='当前('+$('updGroup').selectedOptions[0].textContent+'): '+updSummary(u);
};
$('refreshBtn').onclick=load;
$('uSave').onclick=async()=>{
  const latest=$('uVer').value.trim(),url=$('uUrl').value.trim(),sha=$('uSha').value.trim();
  if(!latest||!url){toast('版本号与下载地址必填');return;}
  try{await api('/api/admin/update',{latest,url,sha256:sha,group:$('updGroup').value});
    toast('更新设置已保存');setTimeout(load,500);}
  catch(e){toast('失败: '+e.message);}
};
$('uClear').onclick=async()=>{
  try{await api('/api/admin/update',{latest:'',url:'',group:$('updGroup').value});toast('已清除该组更新设置');
    $('uVer').value='';$('uUrl').value='';$('uSha').value='';setTimeout(load,500);}
  catch(e){toast('失败: '+e.message);}
};
$('outBtn').onclick=async()=>{await api('/api/admin/logout',{});location.reload();};
$('acctBtn').onclick=async()=>{
  const u=prompt('新用户名（留空保持 '+$('who').textContent+'）');
  if(u===null)return;
  const p=prompt('新密码（至少4位）');
  if(!p){toast('已取消');return;}
  try{await api('/api/admin/account',{username:u||$('who').textContent,password:p});
    toast('账号已更新');}catch(e){toast('失败: '+e.message);}
};

setInterval(()=>{$('clock').textContent=new Date().toLocaleTimeString('zh-CN',{hour12:false});},1000);
setInterval(load,8000);
load();
</script></body></html>`;
}
