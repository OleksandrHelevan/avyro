import {useMutation, useQueryClient} from "@tanstack/react-query";
import {userService} from "../service/userService.ts";
import type {PatchPatientRequest} from "../types.ts";

export const useUpdatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // Використовуємо конкретний тип замість any
    mutationFn: ({id, patientData}: { id: string; patientData: PatchPatientRequest }) =>
      userService.patchPatient(id, patientData),

    onSuccess: (updatedPatient, variables) => {

      queryClient.setQueryData(["patient", variables.id], updatedPatient);
    },
  });
};
