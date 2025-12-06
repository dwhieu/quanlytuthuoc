import { MedicineProvider } from "./context/MedicineContext";
import MedicineList from "./pages/MedicineList";

function App() {
  return (
    <MedicineProvider>
      <MedicineList />
    </MedicineProvider>
  );
}

export default App;
