import { useQuery } from "@tanstack/react-query";
import { userService } from "../service/userService";
export const useDoctor = (userId: string) => {
  return useQuery({
    queryKey: ["doctor", userId],
    queryFn: () => userService.getDoctorById(userId),
    enabled: !!userId,
  });
};
