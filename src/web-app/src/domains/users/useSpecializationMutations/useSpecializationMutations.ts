import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {userService} from "../service/userService.ts";

// Хук для ПРЯМОГО створення
export const useCreateSpecializationDirect = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string }) => userService.createSpecializationDirect(data),
    onSuccess: () => {
      toast.success("Спеціалізацію успішно створено!");
      // Якщо у вас є кеш для загального списку спеціалізацій, оновіть і його
      queryClient.invalidateQueries({ queryKey: ["specializations"] });
    },
    onError: () => toast.error("Помилка створення спеціалізації"),
  });
};

// Хук для ПІДТВЕРДЖЕННЯ запиту
export const useApproveSpecialization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => userService.approveSpecialization(requestId),
    onSuccess: () => {
      toast.success("Запит на спеціалізацію підтверджено!");
      queryClient.invalidateQueries({ queryKey: ["adminSpecializations"] });
      queryClient.invalidateQueries({ queryKey: ["specializations"] });
    },
    onError: () => toast.error("Помилка підтвердження"),
  });
};
