import type { WordPair } from '../types';

interface Props {
  words: WordPair[];
}

export function WordBook({ words }: Props) {
  return (
    <div className="word-book">
      <div className="word-book-header">
        <span className="word-book-title">📖 词语本</span>
        <span className="word-book-count">
          {words.length > 0 ? `已收录 ${words.length} 个词` : ''}
        </span>
      </div>
      {words.length === 0 ? (
        <p className="word-book-empty">完成关卡后，词语会收录在这里～</p>
      ) : (
        <div className="word-book-grid">
          {words.map((pair, i) => (
            <span key={i} className="word-chip">{pair[0]}{pair[1]}</span>
          ))}
        </div>
      )}
    </div>
  );
}
