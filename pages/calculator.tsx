import React, { useState } from "react";
import CalculatorSettings from "../components/calculator/CalculatorSettings.js";
import PersonSettings from "../components/calculator/PersonSettingsPage.js";
import JobSettings from "../components/calculator/JobSettingsPage.js";
import { useRouter } from "next/router";
import TaxSettingsPage from "../components/calculator/TaxSettingsPage.js";

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
        [Subpage.TAX]: TaxSettingsPage,
    };

    let component = map[subpage];

    function runSimulations() {
        void router.push("/graph");
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
