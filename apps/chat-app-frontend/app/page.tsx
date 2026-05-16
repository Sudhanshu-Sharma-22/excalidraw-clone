"use client"
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { useState } from "react";

export default function Home() {

  const router = useRouter();
  const [roomId, setRoomId] = useState("");

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      width: "100vw"
    }}>
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}>
        <input type="text" placeholder="Room id" style={{
          padding: 10,
        }}
          onChange={(e) => setRoomId(e.target.value)} />
        <button style={{
          padding: 10,
        }} onClick={() => {
          router.push(`/room/${roomId}`);
        }}>Join Room</button>
      </div>
    </div>
  );
}
