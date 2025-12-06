import React, { createContext, useReducer, ReactNode } from "react";

export interface Medicine {
  id: string;
  name: string;
  type: string;
  quantity: number;
  expiry: string;
  importDate: string;
  supplier: string;
}

type State = {
  medicines: Medicine[];
};

type Action =
  | { type: "ADD_MEDICINE"; payload: Medicine }
  | { type: "UPDATE_MEDICINE"; payload: Medicine }
  | { type: "DELETE_MEDICINE"; payload: string };

const initialState: State = {
  medicines: [],
};

const MedicineContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
}>({
  state: initialState,
  dispatch: () => {},
});

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_MEDICINE":
      return { ...state, medicines: [...state.medicines, action.payload] };

    case "UPDATE_MEDICINE":
      return {
        ...state,
        medicines: state.medicines.map((m) =>
          m.id === action.payload.id ? action.payload : m
        ),
      };

    case "DELETE_MEDICINE":
      return {
        ...state,
        medicines: state.medicines.filter((m) => m.id !== action.payload),
      };

    default:
      return state;
  }
};

export const MedicineProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <MedicineContext.Provider value={{ state, dispatch }}>
      {children}
    </MedicineContext.Provider>
  );
};

export default MedicineContext;
