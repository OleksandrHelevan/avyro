import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { userService } from "../service/userService";
// Якщо у вас є CreateAppointmentRequest в types.ts, імпортуйте його.
// Або просто опишіть тип прямо тут:

interface AppointmentPayload {
  slotId: string;
  doctorId: string;
}

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // Явно вказуємо, що mutationFn приймає об'єкт AppointmentPayload з двома полями
    mutationFn: (data: AppointmentPayload) => userService.createAppointment(data),

    onSuccess: () => {
      toast.success("Ви успішно записані на прийом! 🎉");
      queryClient.invalidateQueries({ queryKey: ["doctor"] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
        error.response?.data?.detail?.[0]?.msg ||
        "Не вдалося записатися."
      );
    }
  });
};
