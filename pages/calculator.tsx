import React, { useState } from "react";
import CalculatorSettings from "../components/calculator/CalculatorSettings";

export enum Subpage {
  MAIN,
  PERSON,
  JOB,
  RATES,
  TAX,
}

export default function Calculator() {
  let [subpage, setSubpage] = useState(Subpage.MAIN);

  let map: {
    [subpage in Subpage]: React.FC<{ onChangeSubpage: (Subpage) => void }>;
  } = {
    [Subpage.MAIN]: CalculatorSettings,
    [Subpage.PERSON]: CalculatorSettings, // TODO
    [Subpage.JOB]: CalculatorSettings, // TODO
    [Subpage.RATES]: CalculatorSettings, // TODO
    [Subpage.TAX]: CalculatorSettings, // TODO
  };

  let component = map[subpage];

  return component({ onChangeSubpage: setSubpage });
}
