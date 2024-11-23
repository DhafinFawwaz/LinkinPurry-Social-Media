import { Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInput from "../components/form-input";

export const RegisterSchema = z
  .object({
    username: z.string().min(1, "Username is required"),
    email: z.string().email(),
    name: z.string().min(1, "Name is required"),
    password: z.string().min(8, "Password must be at least 8 characters").regex(/[A-Za-z]/, "Password must contain at least one letter").regex(/\d/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
});

export type RegisterSchema = z.infer<typeof RegisterSchema>;

export default function Register() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError} = useForm<RegisterSchema>({mode: "all", resolver: zodResolver(RegisterSchema)});
  
  async function onSubmit(data: RegisterSchema) {
      const response = await fetch("/api/register", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
          "Content-Type": "application/json",
      },
    });
    const responseData = await response.json();
    if (!response.ok) {
      alert("Submitting form failed!");
      return;
    }
  
    if (responseData.errors) {
      const errors = responseData.errors;
      switch (errors) {
        case errors.username: setError("username", { type: "server", message: errors.username,}); break;
        case errors.email: setError("email", { type: "server", message: errors.email,}); break;
        case errors.name: setError("name", { type: "server", message: errors.name,}); break;
        case errors.password: setError("password", { type: "server", message: errors.password,}); break;
        case errors.confirmPassword: setError("confirmPassword", { type: "server", message: errors.confirmPassword,}); break;
        default: alert("Something went wrong!"); break;
      }
    }
  };


  return (
<>
<section className="sm:bg-slate-200 bg-slate-100"> {/* Fallback */}
  <div className="flex min-h-dvh min-h-screen items-center justify-center px-5 mx-auto">
    <div className="w-full rounded-2xl md:mt-0 sm:max-w-md bg-slate-100 border-none p-0 sm:p-8">
      <h1 className="text-3xl font-bold text-slate-700">Register</h1>
      <p className="text-slate-400 mb-4 mt-1">Make the most of your professional life</p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-0 mt-2">
        <FormInput register={register} error={errors.username} field="username" type="text" title="Enter Your Username"></FormInput>
        <FormInput register={register} error={errors.email} field="email" type="text" title="Enter Your Email"></FormInput>
        <FormInput register={register} error={errors.name} field="name" type="text" title="Enter Your Name"></FormInput>
        <FormInput register={register} error={errors.password} field="password" type="password" title="Enter Your Password"></FormInput>
        <FormInput register={register} error={errors.confirmPassword} field={"confirmPassword"} type={"password"} title={"Confirm Your Password"}></FormInput>

        <button disabled={isSubmitting} className="rounded-lg bg-blue-600 hover:bg-blue-700 focus:ring-4 ring-blue-500 py-2 font-bold text-white w-full">Register</button>
      </form>

      <p className="text-slate-500 text-sm mt-3 text-center">Already have an account ? <Link className="hover:underline hover:text-blue-700 focus:text-blue-800 focus:underline" to={"/login"}>Login</Link></p>

    </div>
  </div>
  

</section>
    
</>    
    
  );
}