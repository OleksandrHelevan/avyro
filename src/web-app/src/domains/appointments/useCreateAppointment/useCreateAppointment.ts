import { useMutation } from "@tanstack/react-query";
import type { CreateAppointmentRequest } from "../types";
import {appointmentsService} from "../service/appointmentsService.ts"; // Ваш шлях до файлу types.ts

export const useCreateAppointment = () => {
  return useMutation({
    mutationFn: (payload: CreateAppointmentRequest) => {
      return appointmentsService.createAppointment(payload);
    },
  });
};
