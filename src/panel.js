export function panelHTML(username) {
  return `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
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
.wrap{max-width:1080px;margin:0 auto;padding:22px}
.sec{background:#121923;border:1px solid #223047;border-radius:12px;
padding:16px 18px;margin-bottom:18px}
.sec h2{margin:0 0 12px;font-size:15px;color:#9fb4cc;font-weight:600}
table{width:100%;border-collapse:collapse;font-size:13px}
th,td{text-align:left;padding:8px 10px;border-bottom:1px solid #1b2636;vertical-align:middle}
th{color:#7f93ab;font-weight:600;font-size:12px}
tr:last-child td{border-bottom:0}
.dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px}
.on{background:#22c55e}.off{background:#475569}
.tag{display:inline-block;padding:1px 8px;border-radius:10px;font-size:12px}
.t-restricted{background:#3f1d1d;color:#fca5a5}
.t-restored{background:#14351f;color:#86efac}
.t-unknown{background:#26313f;color:#94a3b8}
.s-pending{background:#3b3413;color:#fde047}
.s-delivered{background:#123448;color:#7dd3fc}
.s-done{background:#14351f;color:#86efac}
.s-failed{background:#3f1d1d;color:#fca5a5}
.row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
input,select{padding:8px 10px;border-radius:7px;border:1px solid #2a3a52;
background:#0d1420;color:#e7eef7;font-size:13px;outline:none}
input:focus{border-color:#3b82f6}
.mono{font-family:Consolas,monospace;font-size:12px;color:#8fa3bb}
.muted{color:#64748b;font-size:12px}
#toast{position:fixed;right:18px;bottom:18px;padding:11px 16px;border-radius:9px;
background:#1e293b;border:1px solid #334155;opacity:0;transition:.25s;pointer-events:none}
#toast.show{opacity:1}
@media(max-width:720px){.wrap{padding:12px}th,td{padding:6px}}
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
    <h2>设备列表 <span class="muted" id="devCount"></span></h2>
    <div class="row" style="margin-bottom:10px">
      <button class="warn" id="allLock">全部下发锁定</button>
      <button class="warn" id="allRestore">全部下发解除</button>
      <input id="newPw" placeholder="新解除密码(4-16位数字)" style="width:190px">
      <button id="setPw">远程修改密码(全部)</button>
      <span class="muted">当前密码: <b id="curPw">-</b></span>
    </div>
    <table><thead><tr>
      <th>状态</th><th>设备</th><th>主机名</th><th>IP</th><th>地区</th><th>版本</th><th>最后上报</th><th>备注</th><th>操作</th>
    </tr></thead><tbody id="devs"></tbody></table>
  </div>
  <div class="sec">
    <h2>静默更新</h2>
    <div class="row">
      <input id="uVer" placeholder="最新版本号，如 1.2.0" style="width:170px">
      <input id="uUrl" placeholder="下载地址 https://.../edgelock.exe" style="flex:1;min-width:240px">
      <input id="uSha" placeholder="SHA256（可选，64位hex）" style="width:230px">
      <button id="uSave">保存更新设置</button>
      <button class="ghost" id="uClear">清除</button>
    </div>
    <div class="muted" style="margin-top:8px" id="uCur">当前: 未设置</div>
  </div>
  <div class="sec">
    <h2>指令历史（最近100条）</h2>
    <table><thead><tr>
      <th>#</th><th>时间</th><th>设备</th><th>类型</th><th>参数</th><th>状态</th><th>结果</th>
    </tr></thead><tbody id="cmds"></tbody></table>
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
  $('cards').innerHTML=[
    ['当前在线',c.online_now],
    ['历史总在线(设备)',c.total_devices],
    ['累计上报次数',c.reports_total],
    ['今日报上次数',c.reports_today],
    ['活跃天数',c.active_days],
  ].map(([k,v])=>\`<div class="card"><div class="v">\${v}</div><div class="k">\${k}</div></div>\`).join('');

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

function render(){
  const d=DATA;
  $('curPw').textContent=d.password;
  const u=d.update||{};
  $('uCur').textContent='当前: '+(u.latest?('版本 '+u.latest+' ← '+(u.url||'未填地址')+(u.sha256?'（含校验）':'（无校验）')):'未设置');
  if(u.latest)$('uVer').placeholder=u.latest;
  const devs=d.devices||[];
  $('devCount').textContent='共 '+devs.length+' 台，在线 '+devs.filter(x=>x.online).length;
  $('devs').innerHTML=devs.length?devs.map(x=>\`
    <tr>
      <td><span class="dot \${x.online?'on':'off'}"></span>\${x.online?'在线':'离线'}</td>
      <td class="mono">\${esc(x.device_id)}</td>
      <td>\${esc(x.hostname)||'-'}</td>
      <td class="mono">\${esc(x.last_ip)||'-'}</td>
      <td class="muted">\${esc(x.region)||'-'}</td>
      <td>\${esc(x.version)||'-'}</td>
      <td class="muted">\${fmtTime(x.last_seen)}</td>
      <td><input data-note="\${esc(x.device_id)}" value="\${esc(x.note||'')}" style="width:110px"></td>
      <td class="row">
        <button class="warn" data-cmd="lock" data-dev="\${esc(x.device_id)}">锁定</button>
        <button data-cmd="restore" data-dev="\${esc(x.device_id)}">解除</button>
        <button class="ghost" data-save="1" data-dev="\${esc(x.device_id)}">存备注</button>
      </td>
    </tr>\`).join(''):\`<tr><td colspan="9" class="muted">暂无设备，等待客户端上报…</td></tr>\`;

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
    const inp=document.querySelector('input[data-note="'+CSS.escape(b.dataset.dev)+'"]');
    try{await api('/api/admin/note',{device_id:b.dataset.dev,note:inp.value});toast('备注已保存');}
    catch(e){toast('失败: '+e.message);}
  }
});

$('allLock').onclick=()=>{if(confirm('确认对全部设备下发锁定？'))send('*','lock');};
$('allRestore').onclick=()=>{if(confirm('确认对全部设备下发解除？'))send('*','restore');};
$('setPw').onclick=async()=>{
  const pw=$('newPw').value.trim();
  if(!/^\\d{4,16}$/.test(pw)){toast('密码须为4-16位数字');return;}
  try{await api('/api/admin/password',{password:pw});
    await api('/api/admin/command',{device_id:'*',type:'setpass',arg:pw});
    toast('密码已修改并下发');$('newPw').value='';setTimeout(load,700);
  }catch(e){toast('失败: '+e.message);}
};
$('refreshBtn').onclick=load;
$('uSave').onclick=async()=>{
  const latest=$('uVer').value.trim(),url=$('uUrl').value.trim(),sha=$('uSha').value.trim();
  if(!latest||!url){toast('版本号与下载地址必填');return;}
  try{await api('/api/admin/update',{latest,url,sha256:sha});toast('更新设置已保存');setTimeout(load,500);}
  catch(e){toast('失败: '+e.message);}
};
$('uClear').onclick=async()=>{
  try{await api('/api/admin/update',{latest:'',url:''});toast('已清除更新设置');$('uVer').value='';$('uUrl').value='';$('uSha').value='';setTimeout(load,500);}
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
