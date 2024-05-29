'use client ';
import React from 'react';
import { Heading } from '@carbon/react';

function AttributeCard({ label, content, bgColor, textColor }) {
  return (
    <div
      className={`mb-3 ${bgColor} min-h-[82px] h-auto rounded-[3px] pt-2 pl-3 pb-3 flex flex-col break-words`}
    >
      <Heading class="text-[#595959] text-sm font-normal leading-4.5 tracking-[0.16px] text-left">
        {label}
      </Heading>
      <Heading
        className={`max-w-full mt-5 ${textColor} text-2xl font-normal leading-[24px] tracking-[0.16px] text-left`}
      >
        {content}
      </Heading>
    </div>
  );
}

export default AttributeCard;
