import { useState, ReactNode } from 'react';
import styles from './TabGroup.module.css';

interface Tab {
  label: string;
  content: ReactNode;
}

interface TabGroupProps {
  tabs: Tab[];
}

export default function TabGroup({ tabs }: TabGroupProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className={styles.tabGroup}>
      <div className={styles.tabList}>
        {tabs.map((tab, idx) => (
          <button
            key={idx}
            className={`${styles.tabItem} ${idx === activeIndex ? styles.activeTab : ''}`}
            onClick={() => setActiveIndex(idx)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className={styles.tabContent}>{tabs[activeIndex].content}</div>
    </div>
  );
}
