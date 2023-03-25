import React, { useState } from "react";
import CalculatorSettings from "../components/calculator/CalculatorSettings";
import PersonSettings from "../components/calculator/PersonSettings";
import JobSettings from "../components/calculator/JobSettings";
import { useRouter } from "next/router";

export enum Subpage {
  MAIN,
  PERSON,
  JOB,
  RATES,
  TAX,
}

export type CalculatorSettingsSubpageProps = {
  changeSubpage: (Subpage) => void;
  runSimulations: () => void;
};

export default function Calculator() {
  let [subpage, setSubpage] = useState(Subpage.MAIN);
  let router = useRouter();

  let map: {
    [subpage in Subpage]: React.FC<CalculatorSettingsSubpageProps>;
  } = {
    [Subpage.MAIN]: CalculatorSettings,
    [Subpage.PERSON]: PersonSettings,
    [Subpage.JOB]: JobSettings,
    [Subpage.RATES]: CalculatorSettings, // TODO
    [Subpage.TAX]: CalculatorSettings, // TODO
  };

  let component = map[subpage];

  function runSimulations() {
    void router.push("/calculator");
  }

  return (
    <>
      {React.createElement(component, {
        changeSubpage: setSubpage,
        runSimulations,
      })}
    </>
  );
}
