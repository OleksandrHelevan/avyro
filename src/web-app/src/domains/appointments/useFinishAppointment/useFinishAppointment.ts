import { useMutation, useQueryClient } from "@tanstack/react-query";
import { appointmentsService } from "../service/appointmentsService.ts";
import toast from "react-hot-toast";

export const useFinishAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => {
      return appointmentsService.finishAppointment(id, { note });
    },
    onSuccess: () => {
      toast.success("Візит успішно завершено!");
      // Оновлюємо дані, щоб статус на сторінці змінився миттєво
      queryClient.invalidateQueries({ queryKey: ["myAppointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointment"] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "Помилка при завершенні візиту";
      toast.error(msg);
    },
  });
};
