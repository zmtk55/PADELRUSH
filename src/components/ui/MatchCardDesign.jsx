import { motion } from 'framer-motion'
import { useState } from 'react'

const COLORS = [
  'from-violet-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-cyan-500 to-blue-600',
  'from-lime-500 to-green-600',
  'from-fuchsia-500 to-purple-600',
  'from-sky-500 to-indigo-600',
]

function getColor(name, idx) {
  const h = name ? name.split('').reduce((a,c)=>a+c.charCodeAt(0),0) : idx
  return COLORS[h % COLORS.length]
}