import {
  type DefaultValues, type FieldValues,
  FormProvider, type SubmitHandler, useForm, type UseFormReturn,
} from "react-hook-form";
import type {ReactNode} from "react";
import "./Form.css";

interface FormProps<T extends FieldValues> {
  children: (methods: UseFormReturn<T>) => ReactNode,
  onSubmit: SubmitHandler<T>,
  title?: string,
  subtitle?: string,
  className?: string,
  defaultValues?: DefaultValues<T>,
  logo?: ReactNode,
  formProps?: { mode: string; defaultValues: { password: string; email: string } }
}

export default function Form<T extends FieldValues>(
  {children, onSubmit, className, defaultValues, title, subtitle}: FormProps<T>) {

  const methods = useForm<T>({
    defaultValues
  });

  return (
    <FormProvider {...methods}>
      <div className="form-card">
        {(title || subtitle) && (
          <div className="form-header-area">
            {title && <h2 className="form-card-title">{title}</h2>}
            {subtitle && <p className="form-card-subtitle">{subtitle}</p>}
          </div>
        )}
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className={`form-main-content ${className || ""}`}
          noValidate
        >
          {children(methods)}
        </form>
      </div>
    </FormProvider>
  );
}
