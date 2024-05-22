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

export default function Home() {
  const searchParams = useSearchParams();
  const topic = searchParams.get('topic');
  const [incommingMessages, setIncommingMessages] = useState([]);
  const [assetName, setAssetName] = useState('');
  const [assetDescription, setAssetDescription] = useState('');
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
    for (const [key, value] of Object.entries(message.payload)) {
      console.log(key, value, typeof value);
      if (typeof value !== 'object' && !Array.isArray(value)) {
        if (key === 'assetName') {
          setAssetName(value);
        } else if (key === 'assetDescription') {
          setAssetDescription(value);
        } else {
          kvSingle.push({ key, value });
        }
      } else if (Array.isArray(value)) {
        kvArray.push({ key, value });
      }
    }
    setCardContent(kvSingle);
    setTableContent(kvArray);
    console.log(kvSingle, kvArray);
  };
  useMqtt({
    uri: 'ws://47.236.10.165:30885/mqtt',
    options: {
      // username: process.env.NEXT_PUBLIC_MQTT_USERNAME,
      // password: process.env.NEXT_PUBLIC_MQTT_PASSWORD,
      clientId: 'client1',
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
          <Heading className="mb-20 text-sm text-[#0F62FE] font-normal leading-4.55 tracking-tighter text-left">
            {assetDescription}
          </Heading>
          <div className="mb-2 flex justify-center">
            <iframe
              src="https://lumalabs.ai/embed/ade32a6a-9e7b-45d7-bf40-767248a76950?mode=sparkles&background=%23ffffff&color=%23000000&showTitle=true&loadBg=true&logoPosition=bottom-left&infoPosition=bottom-right&cinematicVideo=undefined&showMenu=false"
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
            return (
              <AttributeCard
                key={index}
                label={item.key}
                content={item.value}
                bgColor={cardBgColor[index % 3]}
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
          {/* <AttributeCard label="Asset ID" content="12039343" bgColor="bg-white" />
      <AttributeCard
        label="Asset Type"
        content="Motor"
        bgColor="bg-[#D0E2FF]"
      />
      <AttributeCard
        label="Vendor&Model"
        content="Y355L4-8"
        bgColor="bg-[#E0E0E0]"
      />
      <AttributeCard label="Location" content="A-01-F6" bgColor="bg-white" />
      <AttributeCard
        label="Department"
        content="Department01"
        bgColor="bg-[#D0E2FF]"
      /> */}
          {/* <AttributeTable
        label="Maintenance Log"
        headers={headers}
        rows={rows}
      ></AttributeTable> */}

          {/* <Card>
        <h2>Subscribed Topics</h2>
        {incommingMessageHandlers.current.map((i) => (
          <p key={Math.random()}>{i.topic}</p>
        ))}
        <h2>Incomming Messages:</h2>
        {incommingMessages.map((m) => (
          <p key={Math.random()}>
            {m.topic} {JSON.stringify(m.payload)}
          </p>
        ))}
        <button
          onClick={() => {
            console.log(mqttClientRef.current.connected);
            publishMessages(mqttClientRef.current);
          }}
        >
          Publish Test Messages
        </button>
        <button onClick={() => clearMessages()}>Clear Test Messages</button>
      </Card> */}
        </div>
      )}
    </>
  );
}
