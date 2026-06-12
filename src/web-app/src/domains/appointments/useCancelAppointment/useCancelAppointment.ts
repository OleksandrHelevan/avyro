import { useMutation, useQueryClient } from "@tanstack/react-query";
import { appointmentsService } from "../service/appointmentsService.ts";
import toast from "react-hot-toast";

export const useCancelAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // 🚀 Використовуємо наш сервіс
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      return await appointmentsService.cancelAppointment(id, { reason });
    },
    onSuccess: () => {
      toast.success("Візит успішно скасовано");
      // Оновлюємо список візитів, щоб UI миттєво зреагував
      queryClient.invalidateQueries({ queryKey: ["myAppointments"] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || "Не вдалося скасувати візит";
      toast.error(msg);
    }
  });
};
