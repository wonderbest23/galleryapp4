'use client'
import React, { useState } from 'react';
import FroalaEditorComponent from '../components/Froala';

export default function MagazineDetails() {
  const [content, setContent] = useState('');

  const handleEditorChange = (newContent) => {
    setContent(newContent);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">매거진 작성</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            제목
          </label>
          <input
            type="text"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="제목을 입력하세요"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            내용
          </label>
          <FroalaEditorComponent
            value={content}
            onChange={handleEditorChange}
            placeholder="내용을 입력해주세요..."
            height={500}
          />
        </div>
        <div className="flex justify-end">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={() => console.log('저장된 내용:', content)}
          >
            저장하기
          </button>
        </div>
      </div>
    </div>
  );
} 