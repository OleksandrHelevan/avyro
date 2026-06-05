import { useQuery } from "@tanstack/react-query";
import { userService } from "../service/userService";

export const useCheckDoctorStatus = (email: string | null) => {
  return useQuery({
    queryKey: ["doctorStatus", email],
    queryFn: () => userService.checkDoctorStatus(email as string),
    enabled: !!email,
    staleTime: 0,
    refetchOnMount: "always",
  });
};
