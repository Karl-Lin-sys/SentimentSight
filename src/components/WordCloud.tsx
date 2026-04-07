import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import cloud from 'd3-cloud';

interface Word {
  text: string;
  value: number;
  sentiment: 'positive' | 'negative';
}

interface WordCloudProps {
  words: Word[];
  width?: number;
  height?: number;
}

interface CloudWord extends cloud.Word {
  text: string;
  size: number;
  sentiment: 'positive' | 'negative';
  x?: number;
  y?: number;
  rotate?: number;
}

export function WordCloud({ words, width = 500, height = 300 }: WordCloudProps) {
  const [cloudWords, setCloudWords] = useState<CloudWord[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!words || words.length === 0) return;

    const layout = cloud<CloudWord>()
      .size([width, height])
      .words(
        words.map((d) => ({
          text: d.word,
          size: 10 + (d.weight / 100) * 50, // Scale size based on weight (1-100)
          sentiment: d.sentiment,
        } as any))
      )
      .padding(5)
      .rotate(() => (~~(Math.random() * 2) * 90)) // 0 or 90 degrees
      .font('Inter')
      .fontSize((d) => d.size!)
      .on('end', (computedWords) => {
        setCloudWords(computedWords);
      });

    layout.start();
  }, [words, width, height]);

  return (
    <div ref={containerRef} className="flex justify-center items-center w-full h-full overflow-hidden">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
        <g transform={`translate(${width / 2},${height / 2})`}>
          {cloudWords.map((w, i) => (
            <text
              key={i}
              textAnchor="middle"
              transform={`translate(${w.x},${w.y}) rotate(${w.rotate})`}
              style={{
                fontSize: `${w.size}px`,
                fontFamily: 'Inter',
                fill: w.sentiment === 'positive' ? '#10b981' : '#ef4444', // emerald-500 : red-500
                transition: 'all 0.3s ease',
              }}
              className="hover:opacity-80 cursor-default"
            >
              {w.text}
            </text>
          ))}
        </g>
      </svg>
    </div>
  );
}
