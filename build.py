import re,os
HERE=os.path.dirname(os.path.abspath(__file__))
SRC=os.path.join(HERE,'src')
old=open(os.path.join(SRC,'cours.html'),encoding='utf-8').read()
simhtml=open(os.path.join(SRC,'sim_markup.html'),encoding='utf-8').read()
simjs=open(os.path.join(SRC,'sim.js'),encoding='utf-8').read()
model=open(os.path.join(SRC,'model.js'),encoding='utf-8').read()
standalone=open(os.path.join(SRC,'sim.css'),encoding='utf-8').read()

oldcss=re.search(r'<style>(.*?)</style>',old,re.S).group(1)
oldmain=re.search(r'<main class="wrap">(.*?)</main>',old,re.S).group(1)
oldjs=re.search(r'<script>(.*?)</script>',old,re.S).group(1)
simcss=standalone

# --- CSS : variables ElectroLab communes
root=""":root{--bg:#eef1f5;--card:#fff;--panel:#fff;--ink:#1e293b;--mute:#64748b;--muted:#64748b;--line:#d5dbe4;--pcb:#0f766e;--pcb-d:#0b1f2e;--brand:#0f766e;--brand2:#d5f3ef;--cu:#c8793a;--sn:#aeb8c0;--hot:#e5472b;--ok:#15803d;--warn:#b45309;--bad:#b91c1c;--err:#b91c1c;--top:#0b1f2e;--mono:ui-monospace,SFMono-Regular,Menlo,Consolas,"Liberation Mono",monospace}"""
oldcss=re.sub(r':root\{.*?\}','',oldcss,count=1,flags=re.S)
oldcss=re.sub(r'header\.hero[^{]*\{[^}]*\}','',oldcss)
oldcss=re.sub(r'\.hero [^{]*\{[^}]*\}','',oldcss)
oldcss=re.sub(r'nav\.toc[^{]*\{[^}]*\}','',oldcss)
oldcss=oldcss.replace("'Space Grotesk',Inter,sans-serif","system-ui,sans-serif").replace("'Space Grotesk'","system-ui,sans-serif")
simcss=re.sub(r':root\{.*?\}','',simcss,count=1,flags=re.S)
# fonts
def fonts(s):
    s=s.replace("'IBM Plex Mono'","ui-monospace").replace("IBM Plex Mono","ui-monospace")
    s=re.sub(r"\bInter\b","system-ui",s)
    return s
oldcss=fonts(oldcss);oldmain=fonts(oldmain);oldjs=fonts(oldjs)

extra="""
body{font-size:15px}
.wrap{max-width:1100px}
nav.tabs2{position:sticky;top:0;z-index:30;background:#ffffffee;backdrop-filter:blur(6px);border-bottom:1px solid var(--line)}
nav.tabs2 .wrap{display:flex;gap:2px;overflow-x:auto;padding:0 12px;scrollbar-width:none}
nav.tabs2 a{white-space:nowrap;text-decoration:none;color:var(--ink);font-size:13.5px;padding:10px 12px;border-bottom:3px solid transparent}
nav.tabs2 a:hover{color:var(--brand);border-bottom-color:var(--brand)}
section{padding:26px 0 6px}
section h2{font-size:clamp(20px,4vw,26px)}
section h2 .n{border-radius:6px}
.card,.panel,.bay,.stage{border-radius:10px}
.stage{background:#f7f9fc}
.toolbar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:0 0 10px}
.toolbar .score{margin-left:auto;font:13px var(--mono);color:var(--brand);font-weight:700}
.kv{display:grid;grid-template-columns:auto 1fr;gap:2px 12px;font:12.5px var(--mono);margin-top:4px}
.kv span:nth-child(odd){color:var(--muted)}
.kv .okc{color:var(--ok);font-weight:700}.kv .wc{color:var(--warn);font-weight:700}.kv .kc{color:var(--err);font-weight:700}
.simstage .ov.t span{display:block}
.dots button,.tabs button,.opt{font-weight:600}
.simstage .hold{margin:0;padding:8px;background:#fff;border-top:1px solid var(--line);display:flex;gap:8px}.simstage .hold button{flex:1}
@media(max-width:560px){.simstage .ov{position:static;max-width:none;margin:6px 8px;box-shadow:none}.simstage .ov.s{display:none}.simstage .ov.h{margin-top:0}}
.pgrid{display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));margin-top:8px}
.pgrid label{display:flex;flex-direction:column;gap:3px;font-size:12px;color:var(--muted)}.pgrid select{width:100%;color:var(--ink);font-size:13.5px}.pgrid b{color:var(--brand)}
details.panel{margin-bottom:10px}details.panel summary{font-size:14px}
.presets{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}.presets button{font-size:12.5px;padding:5px 10px}
table.est{border-collapse:collapse;width:100%;font:12.5px var(--mono);margin-top:6px}table.est th,table.est td{text-align:left;padding:4px 8px;border-bottom:1px solid var(--line)}table.est th{color:var(--muted);font-weight:600}
table.est .okc{color:var(--ok);font-weight:700}table.est .wc{color:var(--warn);font-weight:700}table.est .kc{color:var(--err);font-weight:700}
.hold{flex-wrap:wrap}.hold button{min-width:84px;padding:8px 6px;font-size:13px;min-height:48px}
"""
css=root+oldcss+simcss+extra+"""
nav.tabs2 a.on{color:var(--brand);border-bottom-color:var(--brand);font-weight:700}
nav.tabs2 a{font-size:14.5px;padding:12px 16px}
.cta{border-left:4px solid var(--brand)}.btn{display:inline-block;background:var(--brand);color:#fff;text-decoration:none;font-weight:700;padding:10px 16px;border-radius:8px}
.simwrap{display:grid;grid-template-columns:minmax(0,1fr) 290px;gap:12px;align-items:start;margin-bottom:10px}
.cutcard h3{margin:0 0 6px;font-size:14px}.cutcard svg{display:block;width:100%;height:auto}
@media(max-width:820px){.simwrap{grid-template-columns:1fr}.cutcard svg{max-width:340px;margin:0 auto}}
.simstage .ov{position:static;max-width:none;margin:6px 8px;box-shadow:none}.simstage .ov.s{display:none}.simstage .ov.h{margin-top:0}
"""

import os,sys
# liens entre les deux pages : relatifs dans le dépôt, absolus pour les artefacts
COURS=os.environ.get('COURS_URL','index.html');SIMU=os.environ.get('SIM_URL','simulateur.html')
OUT=os.environ.get('OUT_SUFFIX','')

def top(active):
    a=lambda h,t,k:f'<a href="{h}"'+(' class="on" aria-current="page"' if k==active else '')+f'>{t}</a>'
    return f"""<header id="top">
  <div class="brand"><span class="logo" aria-hidden="true">⏚</span> BrasageLab <small>Brasage tendre en électronique · Bac Pro CIEL</small><span class="credit">Créé par Yahn LE PRETTRE - Formaxion Landes</span></div>
</header>
<nav class="tabs2"><div class="wrap">
  {a(COURS,'Cours','cours')}{a(SIMU,'Simulateur','sim')}
</div></nav>"""

parts=re.split(r'(?=<section id=")',oldmain)
secs={re.match(r'<section id="(\w+)"',p).group(1):p for p in parts if p.startswith('<section')}
order=['principe','geste','flux','imc','defauts','refusion','securite','quiz']
body=''.join(secs[o] for o in order)
c=[0]
def num(m):
    c[0]+=1;return f'<span class="n">{c[0]}</span>'
body=re.sub(r'<span class="n">[^<]*</span>',num,body)
body=fonts(body)
body+=f'<section><div class="card cta"><b>Passez à la pratique</b><div class="small">Le simulateur reproduit la physique d’un brasage : choisissez l’alliage, le diamètre du fil et la température, puis observez le résultat sur la carte.</div><p><a class="btn" href="{SIMU}">Ouvrir le simulateur →</a></p></div></section>'
simbody=fonts(simhtml)

def page(title,kind,main,scripts):
    return f"""<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="author" content="Yahn LE PRETTRE - Formaxion Landes">
<style>{css}</style>
</head>
<body>
{top(kind)}
<main class="wrap">
{main}
</main>
<footer><div class="wrap">BrasageLab · support pédagogique animé · modèle simplifié (valeurs indicatives, à confronter aux consignes de l’atelier et aux fiches fabricant).</div></footer>
{scripts}
</body>
</html>
"""
cours=page('BrasageLab – Cours de brasage · Bac Pro CIEL','cours',body,f"<script>\n(function(){{\n{oldjs}\n}})();\n</script>")
sim=page('BrasageLab – Simulateur de brasage · Bac Pro CIEL','sim',simbody,f"<script>\n{model}\n</script>\n<script>\n{simjs}\n</script>")
cn,sn=('index','simulateur') if not OUT else ('cours_'+OUT,'simulateur_'+OUT)
d=os.path.join(HERE,'dist') if OUT else HERE
os.makedirs(d,exist_ok=True)
open(os.path.join(d,cn+'.html'),'w',encoding='utf-8').write(cours)
open(os.path.join(d,sn+'.html'),'w',encoding='utf-8').write(sim)
print(len(cours),len(sim))
