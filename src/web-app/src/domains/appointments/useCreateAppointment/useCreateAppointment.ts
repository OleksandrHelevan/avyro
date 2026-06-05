import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {appointmentsService} from "../service/appointmentsService.ts";

interface AppointmentPayload {
  slotId: string;
  doctorId: string;
}

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AppointmentPayload) => appointmentsService.createAppointment(data),

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
