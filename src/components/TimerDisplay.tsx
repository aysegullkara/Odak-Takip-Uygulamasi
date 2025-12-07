import { Text } from "react-native";

export default function TimerDisplay({ seconds }: { seconds: number }) {
  return <Text>{seconds}</Text>;
}
