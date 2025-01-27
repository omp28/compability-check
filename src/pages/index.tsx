import Room from "../components/Room";
import { QuestionCard } from "@/components/QuestionCard";

export default function Home() {
  return (
    <div>
      {/* <Room /> */}
      <QuestionCard
        question="What is the capital of France?"
        options={[
          { id: "paris", text: "Paris" },
          { id: "london", text: "London" },
          { id: "berlin", text: "Berlin" },
          { id: "madrid", text: "Madrid" },
        ]}
        onSubmit={(optionId) => console.log(optionId)}
      />
    </div>
  );
}
