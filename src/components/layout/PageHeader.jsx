import { motion } from 'framer-motion'

export function PageHeader({ title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-6"
    >
      <div>
        <h1 className="font-heading text-foreground uppercase tracking-wider">
          {title}
        </h1>
        {description && (
          <p className="text-[13px] text-fg-secondary mt-0.5">
            {description}
          </p>
        )}
      </div>
      {action && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 }}
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  )
}
