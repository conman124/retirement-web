import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { SettingsGroup, Setting, BackButton } from "./SettingsGroup";
import {
  CalculatorSettingsSubpageProps,
  Subpage,
} from "../../pages/calculator";
import { Dispatch, SetStateAction, useState } from "react";
import {
  AccountContributionSettings,
  AccountContributionSource,
  AccountContributionTaxability,
  setJob,
} from "../../store/simulator";

// TODO fix rounding percentage throughout

export default function PersonSettings(props: CalculatorSettingsSubpageProps) {
  const dispatch = useAppDispatch();
  const job = useAppSelector((state) => state.simulation.job);
  const [salary, setSalary] = useState(job ? "" + job.startingGrossIncome : "");
  const [raise, setRaise] = useState(
    job ? "" + Math.round(job.raiseSettings.amount * 100) : ""
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

  const employeePreTaxAcct = getAcct(
    (acc) =>
      acc.contributionSource === AccountContributionSource.Employee &&
      acc.tax == AccountContributionTaxability.PreTax
  );
  const employeePostTaxAcct = getAcct(
    (acc) =>
      acc.contributionSource === AccountContributionSource.Employee &&
      acc.tax == AccountContributionTaxability.PostTax
  );
  const employerAcct = getAcct(
    (acc) => acc.contributionSource === AccountContributionSource.Employer
  );
  const [
    preTaxContribution,
    setPreTaxContribution,
    preTaxBalance,
    setPreTaxBalance,
  ] = useContributionAndBalanceFromAcct(employeePreTaxAcct);
  const [
    postTaxContribution,
    setPostTaxContribution,
    postTaxBalance,
    setPostTaxBalance,
  ] = useContributionAndBalanceFromAcct(employeePostTaxAcct);
  const [
    employerContribution,
    setEmployerContribution,
    employerBalance,
    setEmployerBalance,
  ] = useContributionAndBalanceFromAcct(employerAcct);

  function validate() {
    // TODO do better
    let warn = "";

    if (Number.isNaN(parseFloat(salary))) {
      warn += "Enter your starting salary. ";
    }

    if (Number.isNaN(parseFloat(raise))) {
      warn += "Enter your annual raise %. ";
    }

    function validateAcct(contribution: string, balance: string, name: string) {
      if (
        Number.isNaN(parseFloat(contribution)) !=
        Number.isNaN(parseFloat(balance))
      ) {
        warn += `Enter or clear both ${name} settings. `;
      }
    }

    validateAcct(preTaxContribution, preTaxBalance, "pre-tax");
    validateAcct(postTaxContribution, postTaxBalance, "post-tax");
    validateAcct(employerContribution, employerBalance, "employer");

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
        !Number.isNaN(startingBalance)
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
        preTaxBalance,
        preTaxContribution,
        AccountContributionSource.Employee,
        AccountContributionTaxability.PreTax
      );
      createAcct(
        postTaxBalance,
        postTaxContribution,
        AccountContributionSource.Employee,
        AccountContributionTaxability.PostTax
      );
      createAcct(
        employerBalance,
        employerContribution,
        AccountContributionSource.Employer,
        AccountContributionTaxability.PreTax
      );

      dispatch(
        setJob({
          startingGrossIncome: parseFloat(salary),
          fica: {
            type: "participant",
            ssRate: 0.13,
          },
          raiseSettings: {
            amount: parseFloat(raise) / 100,
            adjustForInflation: inflationRaise,
          },
          accountContributionSettings: accounts,
        })
      );
      props.changeSubpage(Subpage.MAIN);
    }
  }

  function AccountSettings({
    name,
    contributionPercent,
    setContributionPercent,
    startingBalance,
    setStartingBalance,
  }: {
    name: string;
    contributionPercent: string;
    setContributionPercent: Dispatch<SetStateAction<string>>;
    startingBalance: string;
    setStartingBalance: Dispatch<SetStateAction<string>>;
  }) {
    return (
      <>
        <Setting name={`${name} contribution`}>
          <label className="input-group">
            <input
              type="number"
              placeholder=""
              className="input input-bordered"
              value={contributionPercent}
              onChange={(e) => setContributionPercent(e.target.value)}
            />
            <span>%</span>
          </label>
        </Setting>
        <Setting name={`${name} starting balance`}>
          <label className="input-group">
            <span>$</span>
            <input
              type="number"
              placeholder=""
              className="input input-bordered"
              value={startingBalance}
              onChange={(e) => setStartingBalance(e.target.value)}
            />
          </label>
        </Setting>
      </>
    );
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
        {AccountSettings({
          name: "Employee Pre-tax 401k",
          contributionPercent: preTaxContribution,
          setContributionPercent: setPreTaxContribution,
          startingBalance: preTaxBalance,
          setStartingBalance: setPreTaxBalance,
        })}
        {AccountSettings({
          name: "Employee Post-tax 401k",
          contributionPercent: postTaxContribution,
          setContributionPercent: setPostTaxContribution,
          startingBalance: postTaxBalance,
          setStartingBalance: setPostTaxBalance,
        })}
        {AccountSettings({
          name: "Employeer 401k",
          contributionPercent: employerContribution,
          setContributionPercent: setEmployerContribution,
          startingBalance: employerBalance,
          setStartingBalance: setEmployerBalance,
        })}
      </SettingsGroup>
    </>
  );
}
