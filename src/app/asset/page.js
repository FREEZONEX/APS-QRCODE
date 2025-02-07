'use client';
import { useRef, useState } from 'react';
import useMqtt from '@/lib/useMqtt';
import { useSearchParams } from 'next/navigation';
import { Heading, Tag, InlineNotification } from '@carbon/react';
import { CaretDown, ArrowDownRight } from '@carbon/icons-react';
import AttributeCard from '@/components/AttributeCard';
import AttributeTable from '@/components/AttributeTable';

import './_page.scss';
const cardBgColor = ['bg-white', 'bg-[#D0E2FF]', 'bg-[#E0E0E0]'];
const statusList = {
  1: {
    label: 'Running',
    bg: 'bg-[#D0E2FF]',
    textColor: 'text-[#0F62FE]',
  },
  2: {
    label: 'Maintaining',
    bg: 'bg-[#A7F0BA]',
    textColor: 'text-[#005D5D]',
  },
  3: {
    label: 'Halt',
    bg: 'bg-[#FFD7D9]',
    textColor: 'text-[#9F1853]',
  },
  4: {
    label: 'Stop',
    bg: 'bg-[#E8DAFF]',
    textColor: 'text-[#6929C4]',
  },
};
export default function Home() {
  const searchParams = useSearchParams();
  const topic = searchParams.get('topic');
  const [incommingMessages, setIncommingMessages] = useState([]);
  const [assetName, setAssetName] = useState('');
  const [assetDescription, setAssetDescription] = useState('');
  const [status, setStatus] = useState('');
  const [iframeAddress, setIframeAddress] = useState('');
  const [cardContent, setCardContent] = useState([]);
  const [tableContent, setTableContent] = useState([]);
  const incommingMessageHandlers = useRef([
    {
      topic: topic,
      handler: (message) => {
        console.log(message);
        addMessage(message);
      },
    },
  ]);
  const addMessage = (message) => {
    setIncommingMessages((incommingMessages) => [
      ...incommingMessages,
      message,
    ]);
    console.log(message.payload);
    const kvSingle = [];
    const kvArray = [];
    let responsiblePersonEntry = null;
    let statusEntry = null;
    for (const [key, value] of Object.entries(message.payload)) {
      console.log(key, value, typeof value);
      if (typeof value !== 'object' && !Array.isArray(value)) {
        if (key === 'assetName') {
          setAssetName(value);
        } else if (key === 'assetDescription') {
          setAssetDescription(value);
        } else if (key === 'iframeAddress') {
          setIframeAddress(value);
        } else if (key === 'Responsible Person') {
          responsiblePersonEntry = { key, value };
        } else if (key === 'Status') {
          statusEntry = { key, value };
        } else {
          kvSingle.push({ key, value });
        }
      } else if (Array.isArray(value)) {
        kvArray.push({ key, value });
      }
    }

    if (responsiblePersonEntry) {
      kvSingle.unshift(responsiblePersonEntry);
    }
    if (statusEntry) {
      kvSingle.unshift(statusEntry);
    }
    setCardContent(kvSingle);
    setTableContent(kvArray);
    console.log(kvSingle, kvArray);
  };
  useMqtt({
    uri: 'ws://supos.app:8083/mqtt',
    options: {
      clientId: `client_${Math.random().toString(16).substr(2, 8)}`,
      //rejectUnauthorized: false, // Allow self-signed certificates (if any)
    },
    topicHandlers: incommingMessageHandlers.current,
    onConnectedHandler: (client) => setMqttClient(client),
  });
  const mqttClientRef = useRef(null);
  console.log(mqttClientRef.current, mqttClientRef.current?.connected);

  const setMqttClient = (client) => {
    console.log('connected');
    mqttClientRef.current = client;
    console.log(client, client.connected);
  };
  const clearMessages = () => {
    setIncommingMessages(() => []);
  };
  const publishMessages = (client) => {
    if (!client) {
      console.log('(publishMessages) Cannot publish, mqttClient: ', client);
      return;
    }
    console.log(client.connected);
    client.publish(topic, '1st message from component');
  };
  console.log(tableContent);
  return (
    <>
      {assetName === '' ? (
        <InlineNotification
          className="w-full"
          kind="info"
          hideCloseButton
          title=""
          subtitle="Asset Infomation not published"
        ></InlineNotification>
      ) : (
        <div>
          <Heading class="mt-3 mb-3 text-4xl text-[#0F62FE] font-medium leading-18 tracking-tighter text-left">
            {assetName}
          </Heading>

          <Heading className="mb-12 text-sm text-[#0F62FE] font-normal leading-4.55 tracking-tighter text-left">
            {assetDescription}
          </Heading>
          <div className="mb-12 flex justify-center w-full shadow">
            <iframe
              src={iframeAddress}
              className="w-full"
              height="500"
              frameborder="0"
              title="luma embed"
            ></iframe>
          </div>
          <div className="flex items-end justify-between ">
            <div>
              <CaretDown color="#0F62FE" className="w-[38px] h-[38px] " />
              <CaretDown color="#0F62FE" className="w-[38px] h-[38px] -mt-7" />
              <CaretDown color="#0F62FE" className="w-[38px] h-[38px] -mt-7" />
            </div>
            <ArrowDownRight color="#0F62FE" className="w-[74px] h-[74px]" />
          </div>
          <div className="mb-3 border border-[#0F62FE] border-solid" />
          {cardContent.map((item, index) => {
            if (item.key === 'Status') {
              return (
                <AttributeCard
                  key={index}
                  label={item.key}
                  content={statusList[item.value].label}
                  bgColor={statusList[item.value].bg}
                  textColor={statusList[item.value].textColor}
                />
              );
            }
            return (
              <AttributeCard
                key={index}
                label={item.key}
                content={item.value}
                bgColor={
                  cardBgColor[index - 1 >= 0 ? (index - 1) % 3 : index % 3]
                }
                textColor="text-[#0F62FE]"
              />
            );
          })}
          {tableContent.map((item, index) => {
            console.log(item);
            return (
              <AttributeTable
                key={index}
                label={item.key}
                headers={item.value[0]}
                rows={item.value.slice(1)}
              />
            );
          })}
        </div>
      )}
    </>
  );
}
