import React from 'react';

export const Dialog: React.FC<{ open: boolean; onOpenChange?: (o: boolean) => void } & React.HTMLAttributes<HTMLDivElement>> = ({ open, children }) => (
  open ? <div role="dialog">{children}</div> : null
);

export const DialogContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);

export const DialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);

export const DialogTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, ...props }) => (
  <h3 {...props}>{children}</h3>
);

export const DialogDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ children, ...props }) => (
  <p {...props}>{children}</p>
);

export const DialogFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);

export default Dialog;

