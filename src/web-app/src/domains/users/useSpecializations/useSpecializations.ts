import { useQuery } from "@tanstack/react-query";
import { userService } from "../service/userService";
export const useSpecializations = () => {
  return useQuery({
    queryKey: ["specializations"],
    queryFn: () => userService.getAllSpecializations(),
    // Можна додати час життя кешу, бо спеціалізації рідко змінюються
    staleTime: 1000 * 60 * 60, // 1 година
  });
};
