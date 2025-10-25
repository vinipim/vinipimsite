import { createRoot } from "react-dom/client";

function App() {
  return (
    <div>
      <h1>Vinipim Portfolio</h1>
      <p>Site funcionando!</p>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
