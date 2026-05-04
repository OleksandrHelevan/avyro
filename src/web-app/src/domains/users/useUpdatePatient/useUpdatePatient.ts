import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "../service/userService.ts";

export const useUpdatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // Метод, який ми бачили в userService
    mutationFn: (data: any) => {
      const id = (localStorage.getItem("userId") || "").replace(/"/g, '');
      return userService.patchPatient(id, data);
    },
    onSuccess: () => {
      // КРИТИЧНО: змушуємо React Query заново завантажити дані профілю
      queryClient.invalidateQueries({ queryKey: ["patient"] });
      // Також можна додати сповіщення
      alert("Дані успішно збережено!");
    },
    onError: (error) => {
      console.error("Помилка при збереженні:", error);
    }
  });
};
