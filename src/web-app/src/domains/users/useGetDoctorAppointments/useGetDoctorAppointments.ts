import { useQuery } from "@tanstack/react-query";
import {userService} from "../service/userService.ts";

export const useGetDoctorAppointments = () => {
  return useQuery({
    queryKey: ["doctor-appointments"],
    queryFn: userService.getMyDoctorAppointments,
  });
};
