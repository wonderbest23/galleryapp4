'use client'
import React from "react";
import { Tabs, Tab } from "@heroui/react";
import GalleryCards from "./gallery-cards";

export function GallerySection() {
  return (
    <Tabs aria-label="Gallery options" variant="underlined">
      <Tab key="recommended" title="추천갤러리">
        <GalleryCards />
      </Tab>
      <Tab key="new" title="신규갤러리">
        <GalleryCards />
      </Tab>
      <Tab key="exhibition" title="전시갤러리">
        <GalleryCards />
      </Tab>
    </Tabs>
  );
}