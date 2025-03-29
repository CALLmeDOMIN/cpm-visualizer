import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"; // Importujemy przycisk
import { Switch } from "@/components/ui/switch";

interface Activity {
  id: number;
  name: string;
  duration: number;
  dependency: string;
}

const CPMForm: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([
    { id: 1, name: "", duration: 0, dependency: "" },
  ]);
  const [isFormValid, setIsFormValid] = useState(false); // Stan do sprawdzania poprawności formularza
  const [dependencyErrors, setDependencyErrors] = useState<
    Map<number, boolean>
  >(new Map()); // Map do przechowywania błędów dla każdego wiersza
  const [formError, setFormError] = useState<string>(""); // Przechowuje komunikat o błędach w formularzu
  const [isAoN, setIsAoN] = useState<boolean>(true);

  // Funkcja walidująca, czy nazwa czynności jest unikalna
  const isNameDuplicate = (name: string, id: number) => {
    return activities.some(
      (activity) => activity.name === name && activity.id !== id,
    );
  };

  // Funkcja do sprawdzania, czy dane zależności są unikalne w całym formularzu
  const isDependencyDuplicate = (dependency: string, id: number) => {
    return activities.some(
      (activity) => activity.dependency === dependency && activity.id !== id,
    );
  };

  // Funkcja do zmiany wartości w danym wierszu
  const handleChange = (
    id: number,
    field: keyof Activity,
    value: string | number,
  ) => {
    setActivities((prev) =>
      prev.map((activity) =>
        activity.id === id ? { ...activity, [field]: value } : activity,
      ),
    );
  };

  // Funkcja do walidacji formatu "Następstwo zdarzeń" (np. 1-2)
  const isValidDependency = (value: string): boolean => {
    const regex = /^([0-9]+)-([0-9]+)$/;
    const match = value.match(regex);

    if (match) {
      const firstNum = parseInt(match[1], 10);
      const secondNum = parseInt(match[2], 10);
      return secondNum > firstNum; // Sprawdzamy, czy druga liczba jest większa od pierwszej
    }
    return false;
  };

  // Funkcja do obsługi zmiany wartości w polu "Następstwo"
  const handleDependencyChange = (id: number, value: string) => {
    const isValid = isValidDependency(value);
    setDependencyErrors((prev) => new Map(prev).set(id, !isValid));
    if (!isDependencyDuplicate(value, id)) {
      handleChange(id, "dependency", value);
    }
  };

  // Funkcja sprawdzająca, czy wiersz jest pełny i poprawny
  const isRowValid = (activity: Activity): boolean => {
    return (
      activity.name.trim() !== "" &&
      activity.duration > 0 &&
      activity.dependency.trim() !== "" &&
      isValidDependency(activity.dependency) &&
      !isDependencyDuplicate(activity.dependency, activity.id)
    );
  };

  // Funkcja do dodawania nowego wiersza
  const addRowIfNeeded = () => {
    const lastActivity = activities[activities.length - 1];
    // Dodanie nowego wiersza tylko jeśli ostatni wiersz jest pełny i poprawny
    if (isRowValid(lastActivity)) {
      setActivities((prev) => [
        ...prev,
        { id: prev.length + 1, name: "", duration: 0, dependency: "" },
      ]);
    }
  };

  // Funkcja do usuwania pustych wierszy
  const removeRowIfEmpty = () => {
    setActivities((prev) =>
      prev.filter(
        (activity, index) =>
          // Pierwszy wiersz nie może być usunięty
          index === 0 ||
          activity.name.trim() !== "" ||
          activity.duration > 0 ||
          activity.dependency.trim() !== "",
      ),
    );
  };

  // Funkcja sprawdzająca, czy formularz jest gotowy do generowania
  const isFormReady = () => {
    // Ignorujemy ostatni wiersz w walidacji
    const activitiesWithoutLastRow = activities.slice(0, activities.length - 1);
    const isValidExceptLastRow = activitiesWithoutLastRow.every(isRowValid);

    // Przycisk 'Generuj' jest widoczny, jeśli wszystkie wiersze poza ostatnim są poprawne
    return isValidExceptLastRow && activities.length > 1;
  };

  // Funkcja generująca dane
  const handleGenerate = () => {
    const activitiesWithoutLastRow = activities.slice(0, activities.length - 1);
    console.log("Generowanie wykresu:", { activities: activitiesWithoutLastRow, isAoN });
  };

  useEffect(() => {
    const lastActivity = activities[activities.length - 1];
    // Dodanie nowego wiersza, jeśli poprzedni wiersz jest pełny
    if (isRowValid(lastActivity)) {
      addRowIfNeeded();
    }

    // Sprawdzamy, czy formularz jest gotowy do generowania
    const formIsValid = isFormReady();
    setIsFormValid(formIsValid);
    // Wyświetlamy komunikat o błędach tylko jeśli formularz zawiera więcej niż jeden wiersz
    if (activities.length > 1) {
      setFormError(formIsValid ? "" : "Formularz zawiera błędne dane.");
    } else {
      setFormError("");
    }
  }, [activities]);

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
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="Czynność (np. A)"
                value={activity.name}
                maxLength={1}
                className={`uppercase ${activity.name.trim() === "" || isNameDuplicate(activity.name, activity.id) ? "border-red-500" : ""}`}
                onChange={(e) => {
                  const newValue = e.target.value.toUpperCase();
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
                placeholder="Następstwo (np. 1-2)"
                value={activity.dependency}
                className={`${activity.dependency.trim() === "" || dependencyErrors.get(activity.id) ? "border-red-500" : ""}`}
                onChange={(e) =>
                  handleDependencyChange(activity.id, e.target.value)
                }
                onKeyDown={(e) => {
                  // Allow Backspace to clear the input, so it's empty if needed
                  if (e.key === "Backspace" && activity.dependency === "") {
                    handleChange(activity.id, "dependency", "");
                  }
                }}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Wyświetlanie komunikatu o błędach, tylko jeśli formularz ma więcej niż jeden wiersz */}
      {formError && activities.length > 1 && (
        <div className="mt-2 text-center text-red-500">{formError}</div>
      )}

      {/* Przycisk Generuj */}
      {isFormValid && activities.length > 1 && (
        <div className="mt-4 text-center">
          <Button onClick={handleGenerate}>Generuj</Button>
        </div>
      )}
    </div>
  );
};

export default CPMForm;
