import React from "react";
import { Room } from "../types";
interface gamePageProps {
  room: Room;
  handleLeave: () => void;
}
export default function gamePage({ room, handleLeave }: gamePageProps) {
  return <div>gamePage</div>;
}
