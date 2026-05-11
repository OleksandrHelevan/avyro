import { useQuery } from "@tanstack/react-query";
import { userService } from "../service/userService";
export const useSpecializations = () => {
  return useQuery({
    queryKey: ["specializations"],
    queryFn: () => userService.getAllSpecializations(),
    staleTime: 1000 * 60 * 60, // 1 година
  });
};
