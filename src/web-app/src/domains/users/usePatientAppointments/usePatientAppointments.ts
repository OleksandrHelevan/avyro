import { useQuery } from "@tanstack/react-query";
import { userService } from "../service/userService";

export const usePatientAppointments = () => {
  return useQuery({
    queryKey: ["appointments", "patient"],
    queryFn: () => userService.getPatientAppointments(),
  });
};
