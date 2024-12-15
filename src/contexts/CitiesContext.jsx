import React, { useReducer } from "react";
import { useContext } from "react";
import { useEffect, useCallback } from "react";
import { createContext } from "react";

const CitiesContext = createContext();
const URL = "http://localhost:8000";

function reducer(state, action) {
  switch (action.type) {
    case "loading":
      return { ...state, isLoading: true };
    case "cities/loaded":
      return { ...state, cities: action.payload, isLoading: false };
    case "city/created":
      return {
        ...state,
        cities: [...state.cities, action.payload],
        currentCity: action.payload,
        isLoading: false,
      };
    case "city/deleted":
      return {
        ...state,
        cities: state.cities.filter((city) => city.id !== action.payload),
        isLoading: false,
        currentCity: {},
      };
    case "city/loaded":
      return { ...state, currentCity: action.payload, isLoading: false };
    case "rejected":
      return { ...state, isLoading: false, error: action.payload };
    default:
      throw new Error(state.error);
  }
}
const initialState = {
  cities: [],
  isLoading: false,
  currentCity: {},
  error: "",
};

const CitiesProvider = ({ children }) => {
  const [{ cities, isLoading, currentCity }, dispatch] = useReducer(
    reducer,
    initialState
  );

  useEffect(() => {
    async function fetchCities() {
      try {
        dispatch({ type: "loading" });

        const res = await fetch(`${URL}/cities`);
        const data = await res.json();
        dispatch({ type: "cities/loaded", payload: data });
      } catch {
        dispatch({ type: "rejected", payload: "There was an error fetching." });
      }
    }
    fetchCities();
  }, []);
  const getCity = useCallback(
    async function getCity(id) {
      if (Number(id) === currentCity.id) return;
      try {
        dispatch({ type: "loading" });

        const res = await fetch(`${URL}/cities/${id}`);
        const data = await res.json();
        dispatch({ type: "city/loaded", payload: data });
      } catch {
        dispatch({ type: "rejected", payload: "There was an error fetching." });
      }
    },
    [currentCity.id]
  );

  async function createCity(newCity) {
    try {
      dispatch({ type: "loading" });

      const res = await fetch(`${URL}/cities`, {
        method: "POST",
        body: JSON.stringify(newCity),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      dispatch({
        type: "city/created",
        payload: data,
      });
    } catch {
      dispatch({ type: "rejected", payload: "There was an error creating." });
    }
  }
  async function deleteCity(id) {
    try {
      dispatch({ type: "loading" });

      await fetch(`${URL}/cities/${id}`, {
        method: "DELETE",
      });
      dispatch({
        type: "city/deleted",
        payload: id,
      });
      // setCities((cities) => cities.filter((city) => city.id !== id));
    } catch {
      dispatch({ type: "rejected", payload: "There was an error deleting." });
    }
  }
  return (
    <CitiesContext.Provider
      value={{
        cities,
        isLoading,
        currentCity,
        getCity,
        createCity,
        deleteCity,
      }}
    >
      {children}
    </CitiesContext.Provider>
  );
};
function useCity() {
  const context = useContext(CitiesContext);
  if (context === undefined)
    throw new Error("PostContext was used Outside of the PostProvider");
  return context;
}
export { CitiesProvider, useCity };
