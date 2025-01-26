import React, { useState, useEffect } from "react";
import io from "socket.io-client";

let socket: any;

const Room: React.FC = () => {
  const [room, setRoom] = useState<string>("");
  const [joined, setJoined] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    socket = io("http://localhost:3001");

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("receive_message", (msg: string) => {
        setMessages((prevMessages) => [...prevMessages, msg]);
      });
    }
  }, []);

  const joinRoom = () => {
    if (room) {
      socket.emit("join_room", room);
      setJoined(true);
    }
  };

  const sendMessage = () => {
    if (message && room) {
      const msgData = { room, message };
      socket.emit("send_message", msgData);
      setMessages((prevMessages) => [...prevMessages, message]);
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
      {!joined ? (
        <div className="flex flex-col items-center space-y-4">
          <h1 className="text-2xl font-bold">Join a Room</h1>
          <input
            type="text"
            placeholder="Room ID"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            className="p-2 border border-gray-300 rounded"
          />
          <button
            onClick={joinRoom}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Join Room
          </button>
        </div>
      ) : (
        <div className="w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">Room: {room}</h2>
          <div className="h-64 p-2 border border-gray-300 rounded overflow-y-auto bg-white mb-4">
            {messages.map((msg, idx) => (
              <div key={idx} className="p-1 border-b">
                {msg}
              </div>
            ))}
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Type your message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded"
            />
            <button
              onClick={sendMessage}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Room;
