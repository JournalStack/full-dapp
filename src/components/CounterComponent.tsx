import {
  useCounterRead,
  useCounterNumber,
  useCounterIncrement
} from "../generated";

export function CounterComponent() {
  const { data: currentCount } = useCounterNumber(); // Get the current count
  console.log(currentCount);
  const incrementCounter = useCounterIncrement(); // Hook to increment the counter

  const handleIncrement = async () => {
    try {
      incrementCounter.write(); // Call the increment function on the contract
    } catch (error) {
      console.error("Failed to increment counter:", error);
    }
  };

  return (
    <div>
      {`Count: ${currentCount}`}
      <button onClick={handleIncrement}>Increment</button> {/* Button to increment the counter */}
    </div>
  );
}
