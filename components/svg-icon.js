"use client";

import React from 'react';
import Image from 'next/image';

/**
 * SVG 아이콘 컴포넌트
 * Next.js에서 SVG를 컴포넌트로 사용하기 위한 래퍼
 * 
 * @param {string} src - SVG 파일 경로
 * @param {string} size - 아이콘 크기 (예: '24px', '1.5rem')
 * @param {string} color - 아이콘 색상
 * @param {object} props - 기타 props
 * @returns {JSX.Element} - SVG 아이콘 컴포넌트
 */
const SvgIcon = ({ 
  src, 
  size = '24px', 
  color = 'currentColor',
  alt = '',
  className = '',
  ...props 
}) => {
  // 인라인 SVG 스타일 설정
  if (typeof src === 'function') {
    const SvgComponent = src;
    return (
      <span 
        style={{ 
          fontSize: size, 
          color, 
          display: 'inline-flex', 
          alignItems: 'center',
          justifyContent: 'center' 
        }}
        className={className}
        {...props}
      >
        <SvgComponent width="1em" height="1em" />
      </span>
    );
  }
  
  // URL이나 경로일 경우 next/image 사용
  return (
    <span
      style={{ 
        fontSize: size, 
        color, 
        display: 'inline-flex', 
        alignItems: 'center',
        justifyContent: 'center' 
      }}
      className={className}
      {...props}
    >
      <Image 
        src={src} 
        width={parseInt(size) || 24} 
        height={parseInt(size) || 24} 
        alt={alt}
        style={{ 
          width: '1em', 
          height: '1em',
          objectFit: 'contain'
        }} 
      />
    </span>
  );
};

export default SvgIcon; 