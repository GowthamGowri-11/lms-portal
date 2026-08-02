'use client';

import { useState, useRef, useEffect } from 'react';
import { Bold, Italic, Code, Link, Image, Table, Heading, Eye, Edit3 } from 'lucide-react';
import styles from './MarkdownEditor.module.css';

interface MarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
  height?: number;
  placeholder?: string;
}

export default function MarkdownEditor({
  value,
  onChange,
  height = 380,
  placeholder = 'Write notes using markdown here...',
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [editorHeight, setEditorHeight] = useState(height);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const resizeRef = useRef<{ startY: number; startHeight: number } | null>(null);

  // Simple custom Markdown parser
  const parseMarkdown = (md: string): string => {
    if (!md) return '<p class="text-gray-400 italic">No notes written yet.</p>';
    
    let html = md;

    // Escape HTML characters to avoid XSS in notes
    html = html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // 1. Code blocks (```lang ... ```)
    const codeBlocks: string[] = [];
    html = html.replace(/```([\s\S]*?)```/gm, (match, code) => {
      const index = codeBlocks.length;
      codeBlocks.push(code.trim());
      return `__CODE_BLOCK_${index}__`;
    });

    // 2. Inline code (`code`)
    const inlineCodes: string[] = [];
    html = html.replace(/`([^`]+)`/g, (match, code) => {
      const index = inlineCodes.length;
      inlineCodes.push(code);
      return `__INLINE_CODE_${index}__`;
    });

    // 3. Tables
    // Match tables of format: | header | header | \n | --- | --- | \n | cell | cell |
    html = html.replace(/^\|(.+)\|$\n^\|([-| :]+)\|$\n((?:^\|.+\|$\n?)+)/gm, (match, headers, divider, rows) => {
      const headerHtml = `<tr>${headers.split('|').map((h: string) => `<th>${h.trim()}</th>`).join('')}</tr>`;
      const rowHtml = rows.split('\n').filter((r: string) => r.trim()).map((row: string) => {
        // Remove trailing/leading pipe
        const cells = row.replace(/^\||\|$/g, '').split('|');
        return `<tr>${cells.map((c: string) => `<td>${c.trim()}</td>`).join('')}</tr>`;
      }).join('');
      return `<div class="table-container"><table><thead>${headerHtml}</thead><tbody>${rowHtml}</tbody></table></div>`;
    });

    // 4. Images (![alt](url))
    html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="md-image" />');

    // 5. Links ([text](url))
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="md-link">$1</a>');

    // 6. Headings (# to ######)
    html = html.replace(/^###### (.*?)$/gm, '<h6>$1</h6>');
    html = html.replace(/^##### (.*?)$/gm, '<h5>$1</h5>');
    html = html.replace(/^#### (.*?)$/gm, '<h4>$1</h4>');
    html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');

    // 7. Bold and Italic
    html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/___(.*?)___/g, '<strong><em>$1</em></strong>');
    html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
    html = html.replace(/_(.*?)_/g, '<em>$1</em>');

    // 8. Horizontal Rules
    html = html.replace(/^---$/gm, '<hr />');
    html = html.replace(/^\*\*\*$/gm, '<hr />');

    // 9. Blockquotes
    html = html.replace(/^> (.*?)$/gm, '<blockquote>$1</blockquote>');

    // 10. Unordered Lists (- or *)
    html = html.replace(/^\s*[-*]\s+(.*?)$/gm, '<li>$1</li>');
    // Wrap consecutive list items in <ul>
    html = html.replace(/(<li>.*?<\/li>\n?)+/g, '<ul>$&</ul>');

    // 11. Ordered Lists (1. etc)
    html = html.replace(/^\s*\d+\.\s+(.*?)$/gm, '<li class="ordered">$1</li>');
    // Wrap consecutive list items in <ol>
    html = html.replace(/((<li class="ordered">.*?<\/li>\n?)+)/g, '<ol>$1</ol>').replace(/class="ordered"/g, '');

    // 12. Paragraphs / Double line breaks
    html = html.split(/\n{2,}/).map(para => {
      if (para.trim().startsWith('<h') || para.trim().startsWith('<ul') || para.trim().startsWith('<ol') || para.trim().startsWith('<div') || para.trim().startsWith('<blockquote') || para.trim().startsWith('<hr')) {
        return para;
      }
      return `<p>${para.replace(/\n/g, '<br />')}</p>`;
    }).join('\n');

    // Restore Code Blocks
    codeBlocks.forEach((code, index) => {
      html = html.replace(`__CODE_BLOCK_${index}__`, `<pre><code>${code}</code></pre>`);
    });

    // Restore Inline Code
    inlineCodes.forEach((code, index) => {
      html = html.replace(`__INLINE_CODE_${index}__`, `<code>${code}</code>`);
    });

    return html;
  };

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = prefix + (selected || 'text') + suffix;

    const newValue = text.substring(0, start) + replacement + text.substring(end);
    onChange(newValue);

    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected || 'text').length);
    }, 0);
  };

  // Resize handler
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    resizeRef.current = {
      startY: e.clientY,
      startHeight: editorHeight,
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!resizeRef.current) return;
    const deltaY = e.clientY - resizeRef.current.startY;
    const newHeight = Math.max(250, Math.min(800, resizeRef.current.startHeight + deltaY));
    setEditorHeight(newHeight);
  };

  const handleMouseUp = () => {
    resizeRef.current = null;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div className={styles.container} style={{ height: editorHeight }}>
      {/* Editor Header Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.tabGroup}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'edit' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('edit')}
          >
            <Edit3 size={15} /> Edit
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'preview' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            <Eye size={15} /> Preview
          </button>
        </div>

        {activeTab === 'edit' && (
          <div className={styles.tools}>
            <button type="button" title="Bold" onClick={() => insertMarkdown('**', '**')}>
              <Bold size={15} />
            </button>
            <button type="button" title="Italic" onClick={() => insertMarkdown('*', '*')}>
              <Italic size={15} />
            </button>
            <button type="button" title="Heading" onClick={() => insertMarkdown('### ')}>
              <Heading size={15} />
            </button>
            <span className={styles.divider}></span>
            <button type="button" title="Code Block" onClick={() => insertMarkdown('```\n', '\n```')}>
              <Code size={15} />
            </button>
            <button type="button" title="Link" onClick={() => insertMarkdown('[', '](https://example.com)')}>
              <Link size={15} />
            </button>
            <button type="button" title="Image" onClick={() => insertMarkdown('![Image description](', ')')}>
              <Image size={15} />
            </button>
            <button
              type="button"
              title="Table"
              onClick={() => insertMarkdown('\n| Column 1 | Column 2 |\n| -------- | -------- |\n| Cell 1   | Cell 2   |\n')}
            >
              <Table size={15} />
            </button>
          </div>
        )}
      </div>

      {/* Editor Content Area */}
      <div className={styles.editorArea}>
        {activeTab === 'edit' ? (
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
          />
        ) : (
          <div
            className={styles.preview}
            dangerouslySetInnerHTML={{ __html: parseMarkdown(value) }}
          />
        )}
      </div>

      {/* Resize Handle */}
      <div className={styles.resizeHandle} onMouseDown={handleMouseDown}>
        <div className={styles.resizeLine}></div>
      </div>
    </div>
  );
}
