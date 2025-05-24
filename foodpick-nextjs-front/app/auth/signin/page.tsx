"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function SignIn() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const res = await signIn("credentials", {
        id: formData.get("id"),
        password: formData.get("password"),
        redirect: false,
      });

      if (res?.error) {
        setError("아이디 또는 비밀번호가 올바르지 않습니다.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error(error);
      setError("로그인 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="text-center text-3xl font-bold">로그인</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="id" className="block text-sm font-medium">
                아이디
              </label>
              <input
                id="id"
                name="id"
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            로그인
          </button>
        </form>
      </div>
    </div>
  );
} 