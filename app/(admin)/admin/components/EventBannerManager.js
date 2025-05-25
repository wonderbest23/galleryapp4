import React from "react";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Input,
  Image,
  Spinner,
} from "@heroui/react";
import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";
import { addToast } from "@heroui/react";

export default function EventBannerManager() {
  const supabase = createClient();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.from("event").select("*");
        if (error) {
          console.error("이벤트 데이터 가져오기 오류:", error);
          addToast({
            title: "로드 실패",
            description: "이벤트 데이터를 불러오는 중 오류가 발생했습니다.",
            color: "danger",
          });
        } else {
          // 데이터가 없으면 기본 이벤트 객체 생성
          if (data.length === 0) {
            setEvents([{ id: 1, photo: "", title: "", active: true }]);
          } else {
            setEvents(data);
          }
        }
      } catch (error) {
        console.error("이벤트 데이터 가져오기 중 예외 발생:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleEventChange = (e, id, field) => {
    const { value } = e.target;
    setEvents(
      events.map((event) =>
        event.id === id ? { ...event, [field]: value } : event
      )
    );
  };

  const handleActiveChange = (id, isActive) => {
    setEvents(
      events.map((event) =>
        event.id === id ? { ...event, active: isActive } : event
      )
    );
  };
  
  const addEvent = () => {
    // 새 이벤트 ID는 현재 이벤트 중 가장 큰 ID + 1로 설정
    const newId = events.length > 0 
      ? Math.max(...events.map(event => event.id)) + 1 
      : 1;
    
    setEvents([...events, { id: newId, photo: "", title: "", active: true }]);
  };
  
  const removeEvent = (id) => {
    if (events.length > 1) {
      setEvents(events.filter(event => event.id !== id));
    } else {
      // 마지막 이벤트는 삭제하지 않고 내용만 비움
      setEvents([{ id: events[0].id, photo: "", title: "", active: true }]);
    }
  };

  const onSave = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("event")
        .upsert(events)
        .select();

      if (error) {
        console.log("이벤트 저장 오류:", error);
        addToast({
          title: "저장 실패",
          description: "이벤트 저장 중 오류가 발생했습니다.",
          color: "danger",
        });
      } else {
        console.log("이벤트 저장 성공:", data);
        addToast({
          title: "저장 완료",
          description: "이벤트 배너가 성공적으로 저장되었습니다.",
          color: "success",
        });
        setEvents(data);
      }
    } catch (error) {
      console.error("이벤트 저장 중 예외 발생:", error);
      addToast({
        title: "저장 실패",
        description: "이벤트 저장 중 오류가 발생했습니다.",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      shadow="sm"
      radius="lg"
      className="max-w-full col-span-2 md:col-span-1"
    >
      <CardHeader className="flex gap-3">
        <div className="flex flex-col">
          <p className="text-xl font-semibold">이벤트 배너 관리</p>
          <p className="text-small text-default-500">
            웹사이트에 표시될 이벤트 배너를 관리합니다
          </p>
        </div>
      </CardHeader>
      <CardBody>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="space-y-6">
            {events.length > 0 ? (
              events.map((event, index) => (
                <div key={event.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="font-medium">
                      이벤트 배너 {index + 1}
                    </label>
                    
                  </div>
                  

                  
                  <Input
                    label="배너 이미지 URL"
                    type="text"
                    value={event.photo || ""}
                    onChange={(e) => handleEventChange(e, event.id, "photo")}
                    placeholder="이벤트 배너 이미지 URL을 입력하세요"
                    radius="sm"
                    classNames={{
                      input: "text-small",
                      inputWrapper: "border-1",
                    }}
                  />
                  

                  

                </div>
              ))
            ) : (
              <p>등록된 이벤트 배너가 없습니다.</p>
            )}
            
            {events.length === 0 && (
              <Button 
                onPress={addEvent}
                color="primary"
                variant="flat"
                className="w-full mt-4"
              >
                이벤트 배너 추가하기
              </Button>
            )}
          </div>
        )}
      </CardBody>
      <CardFooter>
        <Button 
          onPress={onSave} 
          color="primary" 
          radius="sm" 
          className="w-full"
          isLoading={isLoading}
          isDisabled={isLoading}
        >
          이벤트 배너 저장하기
        </Button>
      </CardFooter>
    </Card>
  );
} 