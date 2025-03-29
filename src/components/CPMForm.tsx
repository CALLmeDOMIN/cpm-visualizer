import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface Activity {
  id: number;
  name: string;
  duration: number;
  dependency: string;
}

const CPMForm: React.FC = () => {
  const [activitiesAoN, setActivitiesAoN] = useState<Activity[]>([
    { id: 1, name: "", duration: 0, dependency: "" },
  ]);
  const [activitiesAoA, setActivitiesAoA] = useState<Activity[]>([
    { id: 1, name: "", duration: 0, dependency: "" },
  ]);
  const [isFormValid, setIsFormValid] = useState(false);
  const [dependencyErrors, setDependencyErrors] = useState<Map<number, boolean>>(new Map());
  const [formError, setFormError] = useState<string>("");
  const [isAoN, setIsAoN] = useState<boolean>(true);

  const currentActivities = isAoN ? activitiesAoN : activitiesAoA;
  const setCurrentActivities = isAoN ? setActivitiesAoN : setActivitiesAoA;

  const isNameDuplicate = (name: string, id: number) => {
    return currentActivities.some(
      (activity) => activity.name === name && activity.id !== id,
    );
  };

  const isDependencyDuplicate = (dependency: string, id: number) => {
    return isAoN 
      ? currentActivities.some(
          (activity) => activity.dependency === dependency && activity.id !== id
        )
      : false; // W AoA dopuszczamy powtarzające się zależności
  };

  const handleChange = (
    id: number,
    field: keyof Activity,
    value: string | number,
  ) => {
    setCurrentActivities((prev) =>
      prev.map((activity) =>
        activity.id === id ? { ...activity, [field]: value } : activity,
      ),
    );
  };

  const isValidDependency = (value: string, isAoN: boolean): boolean => {
    if (isAoN) {
      const regex = /^([0-9]+)-([0-9]+)$/;
      const match = value.match(regex);
      if (match) {
        const firstNum = parseInt(match[1], 10);
        const secondNum = parseInt(match[2], 10);
        return secondNum > firstNum;
      }
      return false;
    } else {
      // Dla AoA sprawdzamy tylko czy nie jest pusty i czy jest liczbą
      return value.trim() !== "" && !isNaN(Number(value));
    }
  };

  const handleDependencyChange = (id: number, value: string) => {
    const isValid = isValidDependency(value, isAoN);
    setDependencyErrors((prev) => new Map(prev).set(id, !isValid));
    if (!isDependencyDuplicate(value, id)) {
      handleChange(id, "dependency", value);
    }
  };

  const isRowValid = (activity: Activity): boolean => {
    if (isAoN) {
      return (
        activity.name.trim() !== "" &&
        activity.duration > 0 &&
        activity.dependency.trim() !== "" &&
        isValidDependency(activity.dependency, true) &&
        !isDependencyDuplicate(activity.dependency, activity.id)
      );
    } else {
      return (
        activity.name.trim() !== "" &&
        activity.duration > 0 &&
        activity.dependency.trim() !== "" &&
        isValidDependency(activity.dependency, false)
      );
    }
  };

  const addRowIfNeeded = () => {
    const lastActivity = currentActivities[currentActivities.length - 1];
    if (isRowValid(lastActivity)) {
      setCurrentActivities((prev) => [
        ...prev,
        { id: prev.length + 1, name: "", duration: 0, dependency: "" },
      ]);
    }
  };

  const removeRowIfEmpty = () => {
    setCurrentActivities((prev) =>
      prev.filter(
        (activity, index) =>
          index === 0 ||
          activity.name.trim() !== "" ||
          activity.duration > 0 ||
          activity.dependency.trim() !== "",
      ),
    );
  };

  const isFormReady = () => {
    const activitiesWithoutLastRow = currentActivities.slice(0, currentActivities.length - 1);
    const isValidExceptLastRow = activitiesWithoutLastRow.every(isRowValid);

    return isValidExceptLastRow && currentActivities.length > 1;
  };

  const handleGenerate = () => {
    const activitiesWithoutLastRow = currentActivities.slice(0, currentActivities.length - 1);
    console.log("Generowanie wykresu:", { activities: activitiesWithoutLastRow, isAoN });
  };

  useEffect(() => {
    const lastActivity = currentActivities[currentActivities.length - 1];
    if (isRowValid(lastActivity)) {
      addRowIfNeeded();
    }

    const formIsValid = isFormReady();
    setIsFormValid(formIsValid);
    
    if (currentActivities.length > 1) {
      setFormError(formIsValid ? "" : "Formularz zawiera błędne dane.");
    } else {
      setFormError("");
    }
  }, [currentActivities]);

  return (
    <div className="mx-auto max-w-lg p-4">
      <h2 className="mb-4 text-center text-xl font-bold">
        CPM - Wprowadź czynności
      </h2>
      <div className="flex justify-center items-center mb-4">
        <span>{isAoN ? "AoN" : "AoA"}</span>
        <Switch checked={isAoN} onCheckedChange={setIsAoN} className="mx-2" />
      </div>

      <Card>
        <CardContent className="space-y-2 p-4">
          {currentActivities.map((activity) => (
            <div key={activity.id} className="flex items-center gap-2">
              <Input
                type="text"
                placeholder={isAoN ? "Czynność (np. A)" : "Zdarzenie (np. 1)"}
                value={activity.name}
                maxLength={isAoN ? 1 : undefined}
                className={`${isAoN ? "uppercase" : ""} ${
                  activity.name.trim() === "" || isNameDuplicate(activity.name, activity.id) 
                    ? "border-red-500" 
                    : ""
                }`}
                onChange={(e) => {
                  const newValue = isAoN ? e.target.value.toUpperCase() : e.target.value;
                  handleChange(activity.id, "name", newValue);
                  removeRowIfEmpty();
                }}
              />
              <Input
                type="number"
                placeholder="Czas (dni)"
                value={activity.duration}
                min={1}
                className={`${activity.duration <= 0 ? "border-red-500" : ""}`}
                onChange={(e) => {
                  handleChange(activity.id, "duration", Number(e.target.value));
                  removeRowIfEmpty();
                }}
              />
              <Input
                type="text"
                placeholder={isAoN ? "Następstwo (np. 1-2)" : "Poprzednik (np. 1)"}
                value={activity.dependency}
                className={`${
                  activity.dependency.trim() === "" || 
                  (dependencyErrors.get(activity.id) ||
                  (isAoN && isDependencyDuplicate(activity.dependency, activity.id))
                    ? "border-red-500" 
                    : ""
          )}`}
                onChange={(e) =>
                  handleDependencyChange(activity.id, e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && activity.dependency === "") {
                    handleChange(activity.id, "dependency", "");
                  }
                }}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {formError && currentActivities.length > 1 && (
        <div className="mt-2 text-center text-red-500">{formError}</div>
      )}

      {isFormValid && currentActivities.length > 1 && (
        <div className="mt-4 text-center">
          <Button onClick={handleGenerate}>Generuj</Button>
        </div>
      )}
    </div>
  );
};

export default CPMForm;