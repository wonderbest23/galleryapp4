'use client'
import React from "react";
import { Tabs, Tab } from "@heroui/react";
import GalleryCards from "./gallery-cards";
import {useState,useEffect} from "react";
export function GallerySection() {
  const [selectedTab, setSelectedTab] = useState("recommended");
  const [exhibitions, setExhibitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  console.log(selectedTab);
  return (
    <Tabs aria-label="Gallery options" variant="underlined" selectedKey={selectedTab} onSelectionChange={setSelectedTab}>
      <Tab key="recommended" title="추천갤러리">
        <GalleryCards selectedTab={selectedTab} />
      </Tab>
      <Tab key="new" title="신규갤러리">
        <GalleryCards selectedTab={selectedTab} />
      </Tab>
      <Tab key="now" title="전시갤러리">
        <GalleryCards selectedTab={selectedTab} />
      </Tab>
    </Tabs>
  );
}