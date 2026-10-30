// 网站目录：站点 key → 域名后缀 + 标题关键词。
// domains 用于本地 DNS 封禁（后缀匹配，host 等于或以 .domain 结尾即命中）；
// keywords 用于浏览器窗口标题识别（客户端持有一份相同数据，见 edgelock/internal/sites/catalog.go，两处需保持一致）。
export const SITES = [
  { key: 'douyin',     name: '抖音',     domains: ['douyin.com', 'iesdouyin.com', 'amemv.com', 'douyinstatic.com', 'douyinpics.com'], keywords: ['抖音', 'douyin', 'tiktok'] },
  { key: 'kuaishou',   name: '快手',     domains: ['kuaishou.com', 'gifshow.com', 'chenzhongtech.com', 'ksapisrv.com'], keywords: ['快手', 'kuaishou'] },
  { key: 'bilibili',   name: 'b站',      domains: ['bilibili.com', 'bilibili.tv', 'b23.tv', 'biliapi.net', 'biliapi.com', 'hdslb.com', 'bstatic.com', 'acg.tv'], keywords: ['bilibili', '哔哩哔哩', 'b站', '干杯'] },
  { key: 'youtube',    name: 'YouTube',  domains: ['youtube.com', 'youtu.be', 'googlevideo.com', 'ytimg.com'], keywords: ['youtube', '油管'] },
  { key: 'douyu',      name: '斗鱼',     domains: ['douyu.com', 'douyucdn.cn', 'douyuscdn.com'], keywords: ['斗鱼'] },
  { key: 'huya',       name: '虎牙',     domains: ['huya.com', 'huyacdn.com'], keywords: ['虎牙'] },
  { key: 'weibo',      name: '微博',     domains: ['weibo.com', 'weibo.cn', 'weibocdn.com'], keywords: ['微博', 'weibo'] },
  { key: 'zhihu',      name: '知乎',     domains: ['zhihu.com', 'zhimg.com'], keywords: ['知乎', 'zhihu'] },
  { key: 'xhs',        name: '小红书',   domains: ['xiaohongshu.com', 'xhscdn.com'], keywords: ['小红书', 'xhslink'] },
  { key: 'baidu',      name: '百度',     domains: ['baidu.com', 'bdstatic.com', 'bcebos.com', 'baidubce.com'], keywords: ['百度', 'baidu'] },
  { key: 'bing',       name: '必应',     domains: ['bing.com', 'bing.net'], keywords: ['必应', 'bing'] },
  { key: 'google',     name: '谷歌',     domains: ['google.com', 'google.com.hk', 'gstatic.com', 'googleapis.com', 'googleusercontent.com'], keywords: ['google', '谷歌'] },
  { key: 'aiqiyi',     name: '爱奇艺',   domains: ['iqiyi.com', 'iq.com', 'qy.net', 'qyimg.com'], keywords: ['爱奇艺', 'iqiyi'] },
  { key: 'qqvideo',    name: '腾讯视频', domains: ['v.qq.com'], keywords: ['腾讯视频'] },
  { key: 'youku',      name: '优酷',     domains: ['youku.com', 'ykimg.com'], keywords: ['优酷', 'youku'] },
  { key: 'mgtv',       name: '芒果TV',   domains: ['mgtv.com', 'hitv.com'], keywords: ['芒果'] },
  { key: 'taobao',     name: '淘宝',     domains: ['taobao.com', 'tmall.com', 'tbcdn.cn'], keywords: ['淘宝', '天猫', 'taobao', 'tmall'] },
  { key: 'jd',         name: '京东',     domains: ['jd.com', '360buyimg.com', 'jd.hk'], keywords: ['京东'] },
  { key: 'pdd',        name: '拼多多',   domains: ['pinduoduo.com', 'yangkeduo.com'], keywords: ['拼多多'] },
  { key: 'qzone',      name: 'QQ空间',   domains: ['qzone.qq.com', 'qpic.cn'], keywords: ['qq空间', 'qzone'] },
  { key: 'netease',    name: '网易',     domains: ['163.com', '126.net', 'netease.com'], keywords: ['网易', '163'] },
  { key: 'sina',       name: '新浪',     domains: ['sina.com.cn', 'sinaimg.cn', 'sinajs.cn'], keywords: ['新浪', 'sina'] },
  { key: 'sohu',       name: '搜狐',     domains: ['sohu.com', 'itc.cn', 'sohucs.com'], keywords: ['搜狐', 'sohu'] },
  { key: '4399',       name: '4399',     domains: ['4399.com', '4399pk.com'], keywords: ['4399'] },
  { key: '7k7k',       name: '7k7k',     domains: ['7k7k.com'], keywords: ['7k7k'] },
];

const byKey = new Map(SITES.map((s) => [s.key, s]));

export function siteName(key) {
  const s = byKey.get(key);
  return s ? s.name : key;
}

// 域名后缀归属：返回命中的站点 key（自定义域名单独交给客户端）。
export function siteOfDomain(host) {
  const h = String(host || '').toLowerCase().replace(/\.$/, '');
  for (const s of SITES) {
    for (const d of s.domains) {
      if (h === d || h.endsWith('.' + d)) return s.key;
    }
  }
  return '';
}

export function siteOfTitle(title) {
  const t = String(title || '').toLowerCase();
  if (!t) return '';
  for (const s of SITES) {
    for (const kw of s.keywords) {
      if (t.includes(kw.toLowerCase())) return s.key;
    }
  }
  return '';
}

// ban 配置（面板保存的原始 JSON）展开为客户端消费的结构：
// { mode, domains(展开后的封禁后缀), keywords(标题兜底), ver }
export function expandBan(cfg) {
  const mode = ['site', 'all'].includes(cfg && cfg.mode) ? cfg.mode : 'off';
  if (mode === 'off') return { mode: 'off', domains: [], keywords: [], disable: !!cfg.disable, ver: (cfg && cfg.ver) || 0 };
  const domains = new Set();
  const keywords = new Set();
  for (const k of Array.isArray(cfg.sites) ? cfg.sites : []) {
    const s = byKey.get(k);
    if (!s) continue;
    for (const d of s.domains) domains.add(d);
    for (const kw of s.keywords) keywords.add(kw);
  }
  for (const d of Array.isArray(cfg.domains) ? cfg.domains : []) {
    const v = String(d).trim().toLowerCase().replace(/^\*\./, '').replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (/^[a-z0-9.-]+\.[a-z]{2,}$/.test(v)) domains.add(v);
  }
  return { mode, domains: [...domains], keywords: [...keywords], disable: !!cfg.disable, ver: cfg.ver || 0 };
}
