'use client';

import { useEffect, useRef, useState } from 'react';
import MQTT from 'mqtt';  // ✅ Import MQTT directly
import { useSearchParams } from 'next/navigation';
import { InlineNotification } from '@carbon/react';

export default function Home() {
  const searchParams = useSearchParams();
  const topic = searchParams.get('topic') || 'topic1';  // Default topic

  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const mqttClientRef = useRef(null);

  useEffect(() => {
    const uri = 'wss://supos.app:8084/mqtt';  // ✅ Use WSS for secure WebSocket
    const options = {
      clientId: `client_${Math.random().toString(16).substr(2, 8)}`,  
      rejectUnauthorized: false,  // ✅ TEMPORARILY DISABLE SSL CHECK
    };

    console.log("Connecting to MQTT:", uri);
    const client = MQTT.connect(uri, options);

    client.on('connect', () => {
      console.log("✅ Connected to MQTT broker");
      setIsConnected(true);

      client.subscribe(topic, (err) => {
        if (!err) {
          console.log(`📡 Subscribed to topic: ${topic}`);
        } else {
          console.error("❌ Subscription failed:", err);
        }
      });
    });

    client.on('message', (receivedTopic, message) => {
      console.log(`📩 Received message: ${receivedTopic} -> ${message.toString()}`);
      setMessages((prevMessages) => [...prevMessages, { topic: receivedTopic, payload: message.toString() }]);
    });

    client.on('error', (err) => {
      console.error("❌ MQTT Connection Error:", err);
    });

    mqttClientRef.current = client;

    return () => {
      console.log("🔌 Disconnecting from MQTT...");
      client.end();
    };
  }, [topic]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">MQTT WebSocket Test</h1>
      <p>Status: {isConnected ? "🟢 Connected" : "🔴 Disconnected"}</p>

      {messages.length === 0 ? (
        <InlineNotification kind="info" hideCloseButton subtitle="No messages received yet." />
      ) : (
        <div className="mt-4">
          <h2 className="text-lg font-semibold">Received Messages</h2>
          <ul className="bg-gray-100 p-2 rounded">
            {messages.map((msg, index) => (
              <li key={index} className="text-sm">{msg.topic}: {msg.payload}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
