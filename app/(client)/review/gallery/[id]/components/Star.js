import React from "react";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";

  export default function Star({rating, hoverRating, setRating, setHoverRating}) {


  const handleRatingClick = (value) => {
    setRating(value);
  };

  const handleMouseEnter = (value) => {
    setHoverRating(value);
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <Button
            key={value}
            variant="light"
            isIconOnly
            onPress={() => handleRatingClick(value)}
            onMouseEnter={() => handleMouseEnter(value)}
            onMouseLeave={handleMouseLeave}
            className="group"
          >
            <Icon
              icon="lucide:star"
              className={`w-8 h-8 ${
                value <= (hoverRating || rating)
                  ? "text-blue-500 fill-blue-500"
                  : "text-default-300"
              }`}
            />
          </Button>
        ))}
      </div>

    </div>
  );
}