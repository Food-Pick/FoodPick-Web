import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// User 타입 확장
declare module "next-auth" {
    interface User {
        id: string;
        email: string;
        name: string;
        nickname: string;
        gender: string;
        age: number;
        price: number;
        favorite_food: string;
    }

    interface Session {
        user: User & {
            id: string;
            email: string;
            name: string;
            nickname: string;
            gender: string;
            age: number;
            price: number;
            favorite_food: string;
        }
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        email: string;
        nickname: string;
        gender: string;
        age: number;
        price: number;
        favorite_food: string;
    }
}

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                id: { label: "ID", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                try {
                    const response = await fetch(`${process.env.INTERNAL_BACKEND_URL}/auth/login`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            id: credentials?.id,
                            password: credentials?.password,
                        }),
                    });
            
                    const data = await response.json();
                    console.log(data);

                    if (!response.ok) {
                        console.log('로그인 실패');
                        return null;
                    }
                    if (data) {
                        console.log(data);
                        return {
                            id: data.id,
                            name: data.nickname || null,
                            nickname: data.nickname,
                            email: data.email,
                            gender: data.gender,
                            age: data.age,
                            price: data.price,
                            favorite_food: data.favorite_food,
                        };
                    }
                    return null;
                } catch (error) {
                    console.error('Authentication error:', error);
                    return null;
                }
            }
        })
    ],
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async jwt({ token, user }) {
            console.log('jwt', token, user);
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.nickname = (user as any).nickname;
                token.gender = (user as any).gender;
                token.age = (user as any).age;
                token.price = (user as any).price;
                token.favorite_food = (user as any).favorite_food;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user = {
                    ...session.user,
                    id: token.id as string,
                    email: token.email as string,
                    name: token.nickname as string,
                    nickname: token.nickname as string,
                    gender: token.gender as string,
                    age: token.age as number,
                    price: token.price as number,
                    favorite_food: token.favorite_food as string,
                };
            }
            return session;
        },
    },
};
