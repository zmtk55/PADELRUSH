
import os

base = 'X:/padelrush/PadelRush'

def fix(path, replacements):
    fp = os.path.join(base, path)
    with open(fp, 'r') as f:
        c = f.read()
    for old, new in replacements:
        if old in c:
            c = c.replace(old, new)
            print(f"OK: {old[:40]}...")
        else:
            print(f"MISS: {old[:40]}...")
    with open(fp, 'w') as f:
        f.write(c)

# 1. Leagues.jsx
fix('src/pages/Leagues.jsx', [
    ("import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Trophy, Calendar, Swords, ChevronRight } from 'lucide-react'",
     "import { motion } from 'framer-motion'
import { staggerContainer, staggerItem } from '@/lib/animations'
import { Plus, Edit, Trash2, Trophy, Calendar, Swords, ChevronRight } from 'lucide-react'"),
    ("className="bg-card border border-border p-5 animate-pulse"", "className='glass-card rounded-2xl p-5 animate-pulse'"),
    ("className='bg-card border border-border p-5 animate-pulse'", "className='glass-card rounded-2xl p-5 animate-pulse'"),
    (".text-center py-16 bg-card border border-border", ".text-center py-16 glass-card rounded-2xl"),
    (".text-center py-20 bg-card border border-border", ".text-center py-20 glass-card rounded-2xl"),
    ("className="group bg-card border border-border p-5 hover:border-border transition-colors cursor-pointer"", "className='group glass-card rounded-2xl p-5 hover:shadow-glow transition-all duration-300 cursor-pointer'"),
    ("className='group bg-card border border-border p-5 hover:border-border transition-colors cursor-pointer'", "className='group glass-card rounded-2xl p-5 hover:shadow-glow transition-all duration-300 cursor-pointer'"),
])
print('Done: Leagues.jsx')
