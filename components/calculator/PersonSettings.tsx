import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { SettingsGroup, Setting, BackButton } from "./SettingsGroup";
import {
  CalculatorSettingsSubpageProps,
  Subpage,
} from "../../pages/calculator";
import { useState } from "react";
import { Gender, setPerson } from "../../store/simulator";

function ageToBirthday(ageYears: number, ageMonths: number) {
  let cur = new Date();
  let year = cur.getFullYear();
  let month = cur.getMonth();
  let totalMonths = year * 12 + month;
  let birthTotalMonths = totalMonths - ageYears * 12 - ageMonths;
  let birthMonth = birthTotalMonths % 12;
  let birthYear = (birthTotalMonths - birthMonth) / 12;
  return birthYear + "-" + (birthMonth + 1).toString().padStart(2, "0");
}

function birthdayToAge(birthday: string) {
  let [birthYear, birthMonth] = birthday.split("-").map(Number);
  let cur = new Date();
  let year = cur.getFullYear();
  let month = cur.getMonth();
  let totalMonths = year * 12 + month;
  let birthTotalMonths = birthYear * 12 + (birthMonth - 1);
  let age = totalMonths - birthTotalMonths;
  return [Math.floor(age / 12), age % 12];
}

export default function PersonSettings(props: CalculatorSettingsSubpageProps) {
  const dispatch = useAppDispatch();
  const person = useAppSelector((state) => state.simulation.person);
  const [gender, changeGender] = useState(
    person ? person.deathRates.gender : null
  );
  const [birthday, changeBirthday] = useState(
    person ? ageToBirthday(person.ageYears, person.ageMonths) : ""
  );

  function validate() {
    // TODO do better
    let warn = "";

    if (!/^\d{4}-\d{2}$/.test(birthday)) {
      warn = "Pick a birthday. ";
    }
    if (gender === null) {
      warn += "Pick a gender for mortality table. ";
    }

    if (warn) {
      alert(warn);
      return false;
    }
    return true;
  }

  return (
    <>
      <BackButton
        onClick={() => {
          if (validate()) {
            let [ageYears, ageMonths] = birthdayToAge(birthday);
            dispatch(
              setPerson({
                ageYears,
                ageMonths,
                deathRates: {
                  type: "builtin",
                  gender,
                },
              })
            );
            props.changeSubpage(Subpage.MAIN);
          }
        }}
      />
      <SettingsGroup title="Person Settings">
        <Setting name="Birthday" subtext="Used to determine your starting age">
          <input
            className="input input-bordered w-full max-w-xs"
            type="month"
            min="1900-01"
            value={birthday}
            onChange={(e) => changeBirthday(e.target.value)}
          />
        </Setting>
        <Setting name="Mortality Table">
          <div className="form-control w-48">
            <label className="label cursor-pointer">
              <span className="label-text">Male</span>
              <input
                type="radio"
                name="gender"
                className="radio"
                checked={gender === Gender.Male}
                onChange={changeGender.bind(null, Gender.Male)}
              />
            </label>
          </div>
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Female</span>
              <input
                type="radio"
                name="gender"
                className="radio"
                checked={gender === Gender.Female}
                onChange={changeGender.bind(null, Gender.Female)}
              />
            </label>
          </div>
        </Setting>
      </SettingsGroup>
    </>
  );
}
