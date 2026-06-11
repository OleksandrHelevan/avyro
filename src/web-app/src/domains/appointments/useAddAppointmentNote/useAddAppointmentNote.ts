import { useMutation, useQueryClient } from "@tanstack/react-query";
import { appointmentsService } from "../service/appointmentsService.ts";
import toast from "react-hot-toast";

export const useAddAppointmentNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => {
      return appointmentsService.addAppointmentNote(id, { note });
    },
    onSuccess: () => {
      toast.success("Нотатку успішно збережено!");
      // Оновлюємо дані візитів, щоб нова нотатка одразу підтягнулася
      queryClient.invalidateQueries({ queryKey: ["myAppointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointment"] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "Помилка при додаванні нотатки";
      toast.error(msg);
    },
  });
};
