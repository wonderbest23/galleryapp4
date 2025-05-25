import React from "react";
import { Input, Button, Textarea, Checkbox } from "@heroui/react";

export function BasicInfoStep({ form, onChange, onNext, onCancel }) {
  return (
    <div className="p-6 bg-white rounded grid grid-cols-2 gap-4">
      <Input label="전시회명" value={form.contents} onValueChange={v => onChange('contents', v)} className="col-span-2" />
      <Input label="썸네일 URL" value={form.photo} onValueChange={v => onChange('photo', v)} className="col-span-2" />
      <Input label="전시시작" value={form.start_date} onValueChange={v => onChange('start_date', v)} />
      <Input label="전시종료" value={form.end_date} onValueChange={v => onChange('end_date', v)} />
      <Input label="운영 시간" value={form.working_hour} onValueChange={v => onChange('working_hour', v)} />
      <Input label="휴무일" value={form.off_date} onValueChange={v => onChange('off_date', v)} />
      <Input label="홈페이지 URL" value={form.homepage_url} onValueChange={v => onChange('homepage_url', v)} />
      <Input label="리뷰 수" value={form.review_count} onValueChange={v => onChange('review_count', v)} />
      <Input label="평균 평점" value={form.review_average} onValueChange={v => onChange('review_average', v)} />
      <Input label="네이버 갤러리 URL" value={form.naver_gallery_url} onValueChange={v => onChange('naver_gallery_url', v)} />
      <Input label="가격" value={form.price} onValueChange={v => onChange('price', v)} />
      <Textarea label="전시회 내용" value={form.contents} onValueChange={v => onChange('contents', v)} className="col-span-2" />
      <div className="col-span-2 flex justify-end gap-2 mt-4">
        <Button variant="light" onPress={onCancel}>취소</Button>
        <Button color="primary" onPress={onNext}>다음</Button>
      </div>
    </div>
  );
} 