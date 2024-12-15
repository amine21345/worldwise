import React from "react";
import Spinner from "../components/Spinner";
import Message from "../components/Message";
import styles from "./CityList.module.css";
import CityItem from "./CityItem";
import { useCity } from "../contexts/CitiesContext";
const CityList = () => {
  const { cities, isLoading } = useCity();
  if (isLoading) return <Spinner />;
  if (!cities.length)
    return (
      <Message
        message={"Add your first city by clicking on a city on the map"}
      />
    );
  return (
    <ul className={styles.cityList}>
      {cities.map((city, index) => (
        <CityItem city={city} key={index} />
      ))}
    </ul>
  );
};

export default CityList;
