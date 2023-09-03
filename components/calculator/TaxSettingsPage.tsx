import { useAppDispatch, useAppSelector } from "../../store/hooks.js";
import { SettingsGroup, Setting, BackButton } from "./SettingsGroup.js";
import {
    CalculatorSettingsSubpageProps,
    Subpage,
} from "../../pages/calculator.js";
import { Dispatch, SetStateAction, useState } from "react";
import { TaxSettings, setTaxSettings } from "../../store/simulator.js";

export default function TaxSettingsPage(props: CalculatorSettingsSubpageProps) {
    const dispatch = useAppDispatch();
    const taxSettings = useAppSelector((state) => state.simulation.taxSettings);
    const [filingStatus, setFilingStatus] = useState(taxSettings?.filingStatus);
    const [inflateBrackets, setInflateBrackets] = useState(
        taxSettings?.adjustBracketFloorsForInflation ?? true
    );
    const [inflateDeduction, setInflateDeduction] = useState(
        taxSettings?.adjustDeductionForInflation ?? true
    );

    type FilingStatus = typeof taxSettings.filingStatus;

    function validate() {
        if (!filingStatus) {
            alert("Set filing status.");
            return false;
        }

        return true;
    }

    function onBack() {
        if (validate()) {
            dispatch(
                setTaxSettings({
                    filingStatus,
                    adjustBracketFloorsForInflation: inflateBrackets,
                    adjustDeductionForInflation: inflateDeduction,
                })
            );
            props.changeSubpage(Subpage.MAIN);
        }
    }

    return (
        <>
            <BackButton onClick={onBack} />
            <SettingsGroup title="Tax Settings">
                <Setting
                    name="Filing Status"
                    subtext="Used to determine tax brackets"
                >
                    <select
                        className="select select-bordered w-full"
                        value={filingStatus}
                        onChange={(e) =>
                            setFilingStatus(e.target.value as FilingStatus)
                        }
                    >
                        <option disabled selected></option>
                        <option value="single">Single</option>
                        <option value="married_joint">
                            Married filing jointly
                        </option>
                        <option value="head_of_household">
                            Head of household
                        </option>
                    </select>
                </Setting>
                <Setting
                    name="Adjust Tax Rates for Inflation"
                    subtext="Every year of the simulation, the tax rates will be adjusted based on inflation"
                >
                    <input
                        type="checkbox"
                        className="toggle toggle-accent"
                        checked={inflateBrackets}
                        onChange={(e) => setInflateBrackets(e.target.checked)}
                    />
                </Setting>
                <Setting
                    name="Adjust Standard Deduction for Inflation"
                    subtext="Every year of the simulation, the standard deduction will be adjusted based on inflation"
                >
                    <input
                        type="checkbox"
                        className="toggle toggle-accent"
                        checked={inflateDeduction}
                        onChange={(e) => setInflateDeduction(e.target.checked)}
                    />
                </Setting>
            </SettingsGroup>
        </>
    );
}
