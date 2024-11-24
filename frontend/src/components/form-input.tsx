import { FieldError, FieldValues, UseFormRegister } from "react-hook-form"

type FormInputProps<T extends FieldValues> = {
  register: UseFormRegister<T>;
  error: FieldError | undefined;
  field: string | any;
  type: React.HTMLInputTypeAttribute;
  title: string;
}

export default function FormInput<T extends FieldValues>({register, error, field, type, title}: FormInputProps<T>) {
  return <div>
    <div className="relative w-full">
      <input {...register(field)} id={field} type={type} placeholder=" " className={`border-1 peer block w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-2.5 pb-2.5 pt-3 text-sm text-gray-900 focus:outline-none focus:ring-0 ${error ? "border-red-600 focus:bg-[#fee]" : "focus:border-blue-600 focus:bg-[#e8f0fe] hover:border-blue-600"}`}/>
      <label htmlFor={field} className={`absolute top-2 left-1 z-10 origin-[0] -translate-y-4 scale-75 transform cursor-text select-none bg-slate-100 px-2 text-sm text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 rounded-xl ${error ? "peer-focus:text-red-600 peer-focus:bg-[#fee]" : "peer-focus:text-blue-600 peer-focus:bg-[#e8f0fe]"}`}>{title}</label>
    </div>
    <div className={`text-xs text-red-600 text-right font-normal ${error ? "mb-2 mt-0.5" : "mb-4"}`}>{error ? error.message : ""}</div> 
  </div>
}

