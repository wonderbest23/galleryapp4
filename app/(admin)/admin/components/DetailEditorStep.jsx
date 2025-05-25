import React from "react";
import { Button } from "@heroui/react";
import Froala from "./Froala";

export function DetailEditorStep({ form, onChange, onBack, onSave }) {
  return (
    <div className="p-6 bg-white rounded">
      <label className="block mb-2 font-medium">추가 정보</label>
      <Froala
        value={form.add_info}
        onChange={content => onChange('add_info', content)}
      />
      <div className="flex justify-between space-x-2 mt-4">
        <Button variant="light" onPress={onBack}>뒤로</Button>
        <Button color="primary" onPress={onSave}>저장</Button>
      </div>
    </div>
  );
} 