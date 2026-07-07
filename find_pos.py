import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
fp = 'X:/Qoder proyects/PadelRush/src/pages/Express.jsx'
with open(fp, 'r', encoding='utf-8') as f:
    c = f.read()

start_marker = '<Tabs value={activeRound}'
s = c.find(start_marker, 20000)
banner_marker = '{/* All rounds done banner */}'
banner = c.find(banner_marker, s)
tabs_close = c.rfind('</Tabs>', s, banner)

print(f'TABS_START:{s}')
print(f'TABS_CLOSE:{tabs_close}')
print(f'BANNER:{banner}')
print(f'SECTION_LEN:{tabs_close + len("</Tabs>") - s}')
