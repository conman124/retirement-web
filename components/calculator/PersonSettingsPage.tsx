import { useAppDispatch, useAppSelector } from "../../store/hooks.js";
import { SettingsGroup, Setting, BackButton } from "./SettingsGroup.js";
import {
    CalculatorSettingsSubpageProps,
    Subpage,
} from "../../pages/calculator.js";
import { useState } from "react";
import { Gender, setPerson, setCareerPeriods } from "../../store/simulator.js";
import { memoize } from "underscore";

function _checkMonthSupport() {
    const el = document.createElement("input");
    try {
        el.type = "month";
    } catch (e) {
        // nothing to do
    }

    if (el.type === "month") {
        return true;
    } else {
        return false;
    }
}

const checkMonthSupport = memoize(_checkMonthSupport);

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

function retirementAgeFromPeriods(careerPeriods, ageYears, ageMonths) {
    let currentAge = ageYears * 12 + ageMonths;
    let retirementAge = currentAge + careerPeriods;
    return Math.floor(retirementAge / 12);
}

export default function PersonSettingsPage(
    props: CalculatorSettingsSubpageProps
) {
    const dispatch = useAppDispatch();
    const person = useAppSelector((state) => state.simulation.person);
    const careerPeriods = useAppSelector(
        (state) => state.simulation.careerPeriods
    );
    const [gender, changeGender] = useState(
        person ? person.deathRates.gender : null
    );
    const [birthday, changeBirthday] = useState(
        person ? ageToBirthday(person.ageYears, person.ageMonths) : ""
    );
    const [retirementAge, setRetirementAge] = useState(
        person
            ? retirementAgeFromPeriods(
                  careerPeriods,
                  person.ageYears,
                  person.ageMonths
              )
            : NaN
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
        if (Number.isNaN(retirementAge)) {
            warn += "Pick a retirement age. ";
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
                        let careerPeriods =
                            retirementAge * 12 - (ageYears * 12 + ageMonths);
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
                        dispatch(setCareerPeriods(careerPeriods));
                        props.changeSubpage(Subpage.MAIN);
                    }
                }}
            />
            <SettingsGroup title="Person Settings">
                <Setting
                    name="Birthday"
                    subtext={`Used to determine your current age${
                        checkMonthSupport() ? "" : ", YYYY-MM format"
                    }`}
                >
                    <input
                        className="input input-bordered w-full max-w-xs"
                        type="month"
                        min="1900-01"
                        value={birthday}
                        onChange={(e) => changeBirthday(e.target.value)}
                    />
                </Setting>
                <Setting name="Retirement age">
                    <input
                        className="input input-bordered w-full max-w-xs"
                        type="number"
                        value={retirementAge}
                        onChange={(e) =>
                            setRetirementAge(parseInt(e.target.value))
                        }
                    />
                </Setting>
                <Setting
                    name="Mortality Table"
                    subtext="Used to simulate the death age for each run"
                >
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
                                onChange={changeGender.bind(
                                    null,
                                    Gender.Female
                                )}
                            />
                        </label>
                    </div>
                </Setting>
            </SettingsGroup>
        </>
    );
}
