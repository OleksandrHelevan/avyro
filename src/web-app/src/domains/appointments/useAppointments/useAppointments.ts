import { useQuery } from "@tanstack/react-query";
import { appointmentsService } from "../service/appointmentsService.ts";
import type { AppointmentDetailResponse } from "../types.ts";

export const useAppointment = (id: string) =>
  useQuery<AppointmentDetailResponse, Error>({
    queryKey: ["appointment", id],
    queryFn: () => appointmentsService.getAppointmentById(id),
    enabled: !!id,
  });
