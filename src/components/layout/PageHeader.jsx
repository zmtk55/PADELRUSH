import { cn } from "../../lib/utils"

function PageHeader({ title, description, action, className }) {
  return (
    <div className={cn(
      "flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8",
      className
    )}>
      <div className="space-y-1">
        <h1 className="font-heading text-2xl md:text-3xl tracking-wider text-foreground">
          {title}
        </h1>
        {description && (
          <p className="text-sm font-body text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="shrink-0">
          {action}
        </div>
      )}
    </div>
  )
}

export default PageHeader
export { PageHeader }
