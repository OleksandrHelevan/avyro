import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "../service/userService.ts";

export const useUpdatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => {
      return userService.patchPatient( data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient"] });
      alert("Дані успішно збережено!");
    },
    onError: (error) => {
      console.error("Помилка при збереженні:", error);
    }
  });
};
