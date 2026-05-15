import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { userService } from "../service/userService"; // Перевірте свій шлях до сервісу

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slotId: string) => userService.createAppointment(slotId),
    onSuccess: () => {
      toast.success("Ви успішно записані на прийом! 🎉");
      // Оновлюємо дані лікаря, щоб зайнятий час міг зникнути (якщо бекенд це підтримує)
      queryClient.invalidateQueries({ queryKey: ["doctor"] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Не вдалося записатися. Можливо, час вже зайнятий."
      );
    }
  });
};
