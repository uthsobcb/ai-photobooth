import { SignIn } from "@clerk/nextjs"

export default function Page() {
    return (
        <main className="flex min-h-screen items-center justify-center px-5 pb-10 pt-28">
            <SignIn appearance={{ variables: { colorPrimary: "#2330D8", borderRadius: "1rem" } }} />
        </main>
    )
}
