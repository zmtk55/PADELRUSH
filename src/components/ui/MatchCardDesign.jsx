import { motion } from 'framer-motion'
import { useState } from 'react'
import { GRADIENT_PALETTE } from '@/lib/theme-palette'

function getColor(name, idx) {
  const h = name ? name.split('').reduce((a,c)=>a+c.charCodeAt(0),0) : idx
  const g = GRADIENT_PALETTE[h % GRADIENT_PALETTE.length]
  return `${g.from} ${g.to}`
}