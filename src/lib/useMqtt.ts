import type { MqttClient, IClientOptions } from 'mqtt';
import MQTT from 'mqtt';
import { useEffect, useRef } from 'react';

interface useMqttProps {
  uri: string;
  options?: IClientOptions;
  topicHandlers?: { topic: string; handler: (payload: any) => void }[];
  onConnectedHandler?: (client: MqttClient) => void;
}

function useMqtt({
  uri,
  options = {},
  topicHandlers = [],
  onConnectedHandler = (client) => {},
}: useMqttProps) {
  const clientRef = useRef<MqttClient | null>(null);

  useEffect(() => {
    if (!uri || topicHandlers.length === 0) return;

    console.log('Connecting to MQTT:', uri);
    try {
      clientRef.current = MQTT.connect(uri, options);  // ✅ 传入 options
    } catch (error) {
      console.error('❌ MQTT Connection Error:', error);
    }

    const client = clientRef.current;

    client?.on('connect', () => {
      console.log('✅ Connected to MQTT broker');
      if (onConnectedHandler) onConnectedHandler(client);

      topicHandlers.forEach((th) => {
        client?.subscribe(th.topic, (err) => {
          if (!err) {
            console.log('📡 Subscribed to', th.topic);
          } else {
            console.error('❌ Subscription error:', err);
          }
        });
      });
    });

    client?.on('message', (topic, rawPayload, packet) => {
      console.log(`📩 Received message from ${topic}`);
      const handler = topicHandlers.find((t) => t.topic === topic);
      let payload;
      try {
        payload = JSON.parse(rawPayload);
      } catch {
        payload = rawPayload;
      }
      if (handler) handler.handler({ topic, payload, packet });
    });

    client?.on('error', (err) => {
      console.error('❌ MQTT Connection Error:', err);
      client.end();
    });

    return () => {
      console.log('Disconnecting from MQTT...');
      if (client) {
        topicHandlers.forEach((th) => client.unsubscribe(th.topic));
        client.end();
      }
    };
  }, [uri, topicHandlers]);

}

export default useMqtt;
