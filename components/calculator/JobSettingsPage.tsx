import { useAppDispatch, useAppSelector } from "../../store/hooks.js";
import { SettingsGroup, Setting, BackButton } from "./SettingsGroup.js";
import {
    CalculatorSettingsSubpageProps,
    Subpage,
} from "../../pages/calculator.js";
import { Dispatch, SetStateAction, useState } from "react";
import {
    AccountContributionSettings,
    AccountContributionSource,
    AccountContributionTaxability,
    setJob,
} from "../../store/simulator.js";

// TODO fix rounding percentage throughout

export default function JobSettingsPage(props: CalculatorSettingsSubpageProps) {
    const dispatch = useAppDispatch();
    const job = useAppSelector((state) => state.simulation.job);
    const [salary, setSalary] = useState(
        job ? "" + job.startingAnnualGrossIncome : ""
    );
    const [raise, setRaise] = useState(
        job ? "" + Math.round(job.raiseSettings.amount * 100 - 100) : ""
    );
    const [inflationRaise, setInflationRaise] = useState(
        job ? job.raiseSettings.adjustForInflation : false
    );

    function getAcct(predicate) {
        return job ? job.accountContributionSettings.find(predicate) : null;
    }

    function useContributionAndBalanceFromAcct(
        acct
    ): [
        string,
        Dispatch<SetStateAction<string>>,
        string,
        Dispatch<SetStateAction<string>>
    ] {
        const [contribution, setContribution] = useState(
            acct ? "" + Math.round(acct.contributionPercent * 100) : ""
        );
        const [balance, setBalance] = useState(
            acct ? "" + acct.accountSettings.startingBalance : ""
        );
        return [contribution, setContribution, balance, setBalance];
    }

    const employeeAcct = getAcct(
        (acc) => acc.contributionSource === AccountContributionSource.Employee
    );
    const employerAcct = getAcct(
        (acc) => acc.contributionSource === AccountContributionSource.Employer
    );
    const [employeeContribution, setEmployeeContribution, balance, setBalance] =
        useContributionAndBalanceFromAcct(employeeAcct);
    const [employerContribution, setEmployerContribution] =
        useContributionAndBalanceFromAcct(employerAcct);

    function validate() {
        // TODO do better
        let warn = "";

        if (Number.isNaN(parseFloat(salary))) {
            warn += "Enter your starting salary. ";
        }

        if (Number.isNaN(parseFloat(raise))) {
            warn += "Enter your annual raise %. ";
        }

        const hasEmployeeContribution = !Number.isNaN(
            parseFloat(employeeContribution)
        );
        const hasEmployerContribution = !Number.isNaN(
            parseFloat(employerContribution)
        );
        const hasBalance = !Number.isNaN(parseFloat(balance));

        if (
            (hasEmployeeContribution || hasEmployerContribution) &&
            !hasBalance
        ) {
            warn +=
                "Since you have a employee and/or employer contribution, you need to enter the starting balance. ";
        }

        if (warn) {
            alert(warn);
            return false;
        }
        return true;
    }

    function onBack() {
        const accounts: AccountContributionSettings[] = [];

        function createAcct(
            startingBalance: string,
            contributionPercent: string,
            contributionSource: AccountContributionSource,
            tax: AccountContributionTaxability
        ) {
            if (
                !Number.isNaN(parseFloat(contributionPercent)) &&
                !Number.isNaN(parseFloat(startingBalance))
            ) {
                accounts.push({
                    accountSettings: {
                        startingBalance: parseFloat(startingBalance),
                    },
                    contributionPercent: parseFloat(contributionPercent) / 100,
                    contributionSource,
                    tax,
                });
            }
        }

        if (validate()) {
            createAcct(
                balance,
                employeeContribution,
                AccountContributionSource.Employee,
                AccountContributionTaxability.PreTax // doesn't matter right now because we are ignoring taxes
            );
            createAcct(
                "0",
                employerContribution,
                AccountContributionSource.Employer,
                AccountContributionTaxability.PreTax // doesn't matter right now because we are ignoring taxes
            );

            dispatch(
                setJob({
                    startingAnnualGrossIncome: parseFloat(salary),
                    fica: {
                        type: "exempt",
                    },
                    raiseSettings: {
                        amount: parseFloat(raise) / 100 + 1,
                        adjustForInflation: inflationRaise,
                    },
                    accountContributionSettings: accounts,
                })
            );
            props.changeSubpage(Subpage.MAIN);
        }
    }

    return (
        <>
            <BackButton onClick={onBack} />
            <SettingsGroup title="Job Settings">
                <Setting name="Salary" subtext="Current annual gross income">
                    <label className="input-group">
                        <span>$</span>
                        <input
                            type="number"
                            placeholder="100000"
                            className="input input-bordered"
                            value={salary}
                            onChange={(e) => setSalary(e.target.value)}
                        />
                    </label>
                </Setting>
                <Setting name="Annual raise">
                    <label className="input-group">
                        <input
                            type="number"
                            className="input input-bordered"
                            value={raise}
                            onChange={(e) => setRaise(e.target.value)}
                        />
                        <span>%</span>
                    </label>
                </Setting>
                <Setting
                    name="Adjust salary for inflation"
                    subtext="This is in addition to the annual raise"
                >
                    <input
                        type="checkbox"
                        className="toggle toggle-accent"
                        checked={inflationRaise}
                        onChange={(e) => setInflationRaise(e.target.checked)}
                    />
                </Setting>
                <Setting
                    name="Retirement starting balance"
                    subtext="Starting balance for all retirement accounts (401k, 403b, IRA) (Roth or Traditional)"
                >
                    <label className="input-group">
                        <span>$</span>
                        <input
                            type="number"
                            placeholder=""
                            className="input input-bordered"
                            value={balance}
                            onChange={(e) => setBalance(e.target.value)}
                        />
                    </label>
                </Setting>
                <Setting name="My contribution to retirement">
                    <label className="input-group">
                        <input
                            type="number"
                            placeholder=""
                            className="input input-bordered"
                            value={employeeContribution}
                            onChange={(e) =>
                                setEmployeeContribution(e.target.value)
                            }
                        />
                        <span>%</span>
                    </label>
                </Setting>
                <Setting name="Employer's contribution to retirement">
                    <label className="input-group">
                        <input
                            type="number"
                            placeholder=""
                            className="input input-bordered"
                            value={employerContribution}
                            onChange={(e) =>
                                setEmployerContribution(e.target.value)
                            }
                        />
                        <span>%</span>
                    </label>
                </Setting>
            </SettingsGroup>
        </>
    );
}
