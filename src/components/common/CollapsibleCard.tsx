import { useState, ReactNode } from 'react';
import styles from './CollapsibleCard.module.css';

interface CollapsibleCardProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export default function CollapsibleCard({ title, children, defaultOpen = true }: CollapsibleCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={styles.card}>
      <button className={styles.header} onClick={() => setOpen(!open)} type="button">
        {title}
        <span className={styles.icon}>{open ? '▾' : '▸'}</span>
      </button>
      {open && <div className={styles.body}>{children}</div>}
    </div>
  );
}
