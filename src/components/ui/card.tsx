// frontend/src/components/ui/card.tsx
import * as React from "react"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => (
    <div
      ref={ref}
      className={`card ${className}`} // Apply 'card' class for base styles
      {...props}
    />
  )
);
Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => (
    <div
      ref={ref}
      className={`card-header ${className}`} // Apply 'card-header' class
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className = '', ...props }, ref) => (
    <h3
      ref={ref}
      className={`card-title ${className}`} // Apply 'card-title' class
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => (
    <div 
      ref={ref} 
      className={`card-content ${className}`} // Apply 'card-content' class
      {...props} 
    />
  )
);
CardContent.displayName = "CardContent"

export { Card, CardHeader, CardTitle, CardContent }