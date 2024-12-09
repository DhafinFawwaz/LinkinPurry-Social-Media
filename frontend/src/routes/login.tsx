import { Link, useNavigate } from "react-router-dom"
import { FieldValues, useForm } from "react-hook-form"
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInput from "../components/form-input";
import { fetchApi } from "../hooks/useFetchApi";
import { toast, ToastContainer, Zoom } from "react-toastify";

export const LoginSchema = z.object({
  identifier: z.string().min(1, "Email or Username is required"),
  password: z.string().min(8, "Password must be at least 8 characters").regex(/[A-Za-z]/, "Password must contain at least one letter").regex(/\d/, "Password must contain at least one number"),
});
export type LoginSchema = z.infer<typeof LoginSchema>;

export default function Login({ onLogin: onLogin }: { onLogin?: () => void }) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError} = useForm<LoginSchema>({mode: "all", resolver: zodResolver(LoginSchema)});

  async function onSubmit(data: LoginSchema) {
    const response = await fetchApi("/api/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
    
    try {
      const responseData = await response.json();
      if (responseData.errors) {
        const errors = responseData.errors;
        if(errors.identifier) {
          setError("identifier", { type: "server", message: errors.identifier,});
          toast.error("Please enter a valid usename or email.");
        }
        if(errors.password) {
          setError("password", { type: "server", message: errors.password,});
          toast.error("Please enter a valid password.");
        }
      } else {
        if (onLogin) onLogin();
      }
    } catch (e) {
      // alert(e);
      toast.error("Error. Please try again later.");
    }
  };

  return (
<>
<ToastContainer
  position="bottom-left"
  hideProgressBar={true}
  transition={Zoom}
  autoClose={3000} 
  draggable
/>

<section className="sm:bg-background_grey bg-white"> {/* Fallback */}
  <div className="flex min-h-dvh min-h-screen items-center justify-center px-5 mx-auto">
    <div className="w-full rounded-2xl md:mt-0 sm:max-w-md bg-white sm:border border-gray-300 p-0 sm:p-8">
      <h1 className="text-3xl font-bold text-slate-700">Login</h1>
      <p className="text-slate-400 mb-4 mt-1">Make the most of your professional life</p>


      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-0 mt-2">
        <FormInput register={register} error={errors.identifier} field={"identifier"} type={"text"} title={"Enter Your Email or Username"}></FormInput>
        <FormInput register={register} error={errors.password} field={"password"} type={"password"} title={"Enter Your Password"}></FormInput>

        <button disabled={isSubmitting} className="disabled:cursor-not-allowed disabled:bg-slate-400 disabled:text-slate-200 rounded-lg bg-blue_primary hover:bg-blue_hover focus:ring-4 ring-blue-500 py-2 font-bold text-white w-full">Login</button>
      </form>

      <p className="text-slate-500 text-sm mt-3 text-center">Don't have an account ? <Link className="hover:underline hover:text-blue_primary focus:text-blue_hover focus:underline" to={"/register"}>Register</Link></p>
    </div>
  </div>
  

</section>
    
</>    
    
  );
}