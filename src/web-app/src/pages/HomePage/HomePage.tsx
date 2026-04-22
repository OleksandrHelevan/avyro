import {usePatient} from "../../domains/users/usePatient/usePatient.ts";

export default function HomePage() {
  console.log("Current Token:", localStorage.getItem("accessToken"));

  const {data, isLoading, error} = usePatient("69e7bce4af23b3a592840f86");

  if (isLoading) return <div>Завантаження...</div>;
  if (error) return <div>Помилка: {error.message}</div>;

  console.log("Перемога! Дані пацієнта:", data);

  return (
    <div className="home-container">
      <h1>Пацієнт: {data?.fullName || "Завантажено"}</h1>
    </div>
  );
}
