import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";


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
                token.nickname = user.nickname;
                token.gender = user.gender;
                token.age = user.age;
                token.price = user.price;
                token.favorite_food = user.favorite_food;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.email = token.email as string;
                session.user.nickname = token.nickname as string;
                session.user.gender = token.gender as string;
                session.user.age = token.age as number;
                session.user.price = token.price as string;
                session.user.favorite_food = token.favorite_food as string;
            }
            return session;
        },
    },
};
