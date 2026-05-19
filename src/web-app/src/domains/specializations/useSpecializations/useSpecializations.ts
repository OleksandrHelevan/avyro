import { useQuery } from "@tanstack/react-query";
import {specializationService} from "../service/specializationsService.ts";
export const useSpecializations = () => {
  return useQuery({
    queryKey: ["specializations"],
    queryFn: () => specializationService.getAllSpecializations(),
    staleTime: 1000 * 60 * 60,
  });
};
