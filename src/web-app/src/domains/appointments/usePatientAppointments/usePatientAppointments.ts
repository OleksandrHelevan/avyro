import { useQuery } from "@tanstack/react-query";
import {appointmentsService} from "../service/appointmentsService.ts";

export const usePatientAppointments = () => {
  return useQuery({
    queryKey: ["appointments", "patient"],
    queryFn: () => appointmentsService.getMyPatientAppointments(),
  });
};
